/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Iterable } from '../../common/index.js';
import { injectable } from '../../ioc/index.js';

export function once<T extends (...args: any[]) => any>(this: unknown, fn: T): T {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const _this = this;
  let didCall = false;
  let result: unknown;

  return function () {
    if (didCall) {
      return result;
    }

    didCall = true;
    // eslint-disable-next-line prefer-rest-params
    result = fn.apply(_this, [...arguments]);

    return result;
  } as unknown as T;
}

/**
 * Enables logging of potentially leaked disposables.
 *
 * A disposable is considered leaked if it is not disposed or not registered as the child of
 * another disposable. This tracking is very simple an only works for classes that either
 * extend VSDisposable or use a DisposableStore. This means there are a lot of false positives.
 */
const TRACK_DISPOSABLES = false;
let disposableTracker: IDisposableTracker | null = null;

export interface IDisposableTracker {
  trackDisposable: (x: IDisposable) => void;
  markTracked: (x: IDisposable) => void;
}

export function setDisposableTracker(tracker: IDisposableTracker | null): void {
  disposableTracker = tracker;
}

if (TRACK_DISPOSABLES) {
  const __is_disposable_tracked__ = '__is_disposable_tracked__';
  disposableTracker = new (class implements IDisposableTracker {
    trackDisposable(x: IDisposable): void {
      const stack = new Error('Potentially leaked disposable').stack!;
      setTimeout(() => {
        if (!(x as any)[__is_disposable_tracked__]) {
          console.warn(stack);
        }
      }, 3000);
    }

    markTracked(x: IDisposable): void {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      if (x && x !== VSDisposable.None) {
        try {
          (x as any)[__is_disposable_tracked__] = true;
        } catch {
          // noop
        }
      }
    }
  })();
}

function markTracked<T extends IDisposable>(x: T): void {
  if (!disposableTracker) {
    return;
  }
  disposableTracker.markTracked(x);
}

export function trackDisposable<T extends IDisposable>(x: T): T {
  if (!disposableTracker) {
    return x;
  }
  disposableTracker.trackDisposable(x);
  return x;
}

export class MultiDisposeError extends Error {
  public readonly errors: any[];

  constructor(errors: any[]) {
    super(
      `Encountered errors while disposing of store. Errors: [${errors.join(', ')}]`,
    );
    this.errors = errors;
  }
}

export interface IDisposable {
  dispose: () => void;
}

export function isDisposable<E extends object>(thing: E): thing is E & IDisposable {
  return (
    typeof (<IDisposable>thing).dispose === 'function' &&
    (<IDisposable>thing).dispose.length === 0
  );
}

export function dispose<T extends IDisposable>(disposable: T): T;
export function dispose<T extends IDisposable>(
  disposable: T | undefined,
): T | undefined;
export function dispose<
  T extends IDisposable,
  A extends IterableIterator<T> = IterableIterator<T>,
>(disposables: IterableIterator<T>): A;
export function dispose<T extends IDisposable>(disposables: T[]): T[];
export function dispose<T extends IDisposable>(disposables: readonly T[]): readonly T[];
export function dispose<T extends IDisposable>(
  arg: T | IterableIterator<T> | undefined,
): any {
  if (Iterable.is(arg)) {
    const errors: any[] = [];

    for (const d of arg) {
      if (d) {
        markTracked(d);
        try {
          d.dispose();
        } catch (e) {
          errors.push(e);
        }
      }
    }

    if (errors.length === 1) {
      throw errors[0];
    } else if (errors.length > 1) {
      throw new MultiDisposeError(errors);
    }

    return Array.isArray(arg) ? [] : arg;
  }
  if (arg) {
    markTracked(arg);
    arg.dispose();
    return arg;
  }
}

export function combinedDisposable(...disposables: IDisposable[]): IDisposable {
  disposables.forEach(markTracked);
  return toDisposable(() => dispose(disposables));
}

export function toDisposable(fn: () => void): IDisposable {
  const self = trackDisposable({
    dispose: () => {
      markTracked(self);
      fn();
    },
  });
  return self;
}

export class DisposableStore implements IDisposable {
  static DISABLE_DISPOSED_WARNING = false;

  private _toDispose = new Set<IDisposable>();
  private _isDisposed = false;

  /**
   * Dispose of all registered disposables and mark this object as disposed.
   *
   * Any future disposables added to this object will be disposed of on `add`.
   */
  public dispose(): void {
    if (this._isDisposed) {
      return;
    }

    markTracked(this);
    this._isDisposed = true;
    this.clear();
  }

  /**
   * Dispose of all registered disposables but do not mark this object as disposed.
   */
  public clear(): void {
    try {
      dispose(this._toDispose.values());
    } finally {
      this._toDispose.clear();
    }
  }

  public add<T extends IDisposable>(t: T): T {
    if (!t) {
      return t;
    }
    if ((t as unknown as DisposableStore) === this) {
      throw new Error('Cannot register a disposable on itself!');
    }

    markTracked(t);
    if (this._isDisposed) {
      if (!DisposableStore.DISABLE_DISPOSED_WARNING) {
        console.warn(
          new Error(
            'Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!',
          ).stack,
        );
      }
    } else {
      this._toDispose.add(t);
    }

    return t;
  }
}

@injectable()
export abstract class VSDisposable implements IDisposable {
  static readonly None = Object.freeze<IDisposable>({
    dispose() {
      //
    },
  });

  private readonly _store = new DisposableStore();

  constructor() {
    trackDisposable(this);
  }

  public dispose(): void {
    markTracked(this);

    this._store.dispose();
  }

  protected _register<T extends IDisposable>(t: T): T {
    if ((t as unknown as VSDisposable) === this) {
      throw new Error('Cannot register a disposable on itself!');
    }
    return this._store.add(t);
  }
}

/**
 * Manages the lifecycle of a disposable value that may be changed.
 *
 * This ensures that when the disposable value is changed, the previously held disposable is disposed of. You can
 * also register a `MutableDisposable` on a `VSDisposable` to ensure it is automatically cleaned up.
 */
export class MutableDisposable<T extends IDisposable> implements IDisposable {
  private _value?: T | undefined;
  private _isDisposed = false;

  constructor() {
    trackDisposable(this);
  }

  get value(): T | undefined {
    return this._isDisposed ? undefined : this._value;
  }

  set value(value: T | undefined) {
    if (this._isDisposed || value === this._value) {
      return;
    }

    this._value?.dispose();
    if (value) {
      markTracked(value);
    }
    this._value = value;
  }

  clear() {
    this.value = undefined;
  }

  dispose(): void {
    this._isDisposed = true;
    markTracked(this);
    this._value?.dispose();
    this._value = undefined;
  }
}

export interface IReference<T> extends IDisposable {
  readonly object: T;
}

export abstract class ReferenceCollection<T> {
  private readonly references: Map<string, { readonly object: T; counter: number }> =
    new Map();

  acquire(key: string, ...args: any[]): IReference<T> {
    let reference = this.references.get(key);

    if (!reference) {
      reference = { counter: 0, object: this.createReferencedObject(key, ...args) };
      this.references.set(key, reference);
    }

    const { object } = reference;
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const dispose = once(() => {
      if (--reference!.counter === 0) {
        this.destroyReferencedObject(key, reference!.object);
        this.references.delete(key);
      }
    });

    reference.counter++;

    return { object, dispose };
  }

  protected abstract createReferencedObject(key: string, ...args: any[]): T;
  protected abstract destroyReferencedObject(key: string, object: T): void;
}

export class ImmortalReference<T> implements IReference<T> {
  public object: T;
  constructor(object: T) {
    this.object = object;
  }
  dispose(): void {
    /* noop */
  }
}
