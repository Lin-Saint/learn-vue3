import { extend } from "../shared";

let activeEffect;
let shouldTrack = false;

class ReactiveEffect {
  private _fn: any;
  deps = [];
  active = true;
  onStop?: () => void;
  public scheduler: Function | undefined;
  constructor(fn, scheduler?: Function) {
    this._fn = fn;
    this.scheduler = scheduler;
  }
  run() {
    //只有调用了stop的方法active才会为false，所以当active为false代表已经调用过了stop，此时直接调用回调函数并返回结果
    if (!this.active) {
      return this._fn();
    }

    shouldTrack = true;
    activeEffect = this;

    const res = this._fn();

    shouldTrack = false;
    return res;
  }
  stop() {
    if (this.active) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}

function cleanupEffect(effect) {
  const { deps } = effect;
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect);
    }
    deps.length = 0;
  }
}

const targetMap = new Map();
export const track = (target, key) => {
  if (!isTracking()) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  if (dep.has(activeEffect)) return;

  dep.add(activeEffect);
  activeEffect.deps.push(dep);
};

function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

export const trigger = (target, key) => {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
};

// type effectOptions = {
//   scheduler?: Function;
//   onStop?: Function;
// };

export const effect = (fn, options: any = {}) => {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  extend(_effect, options);

  _effect.run();
  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
};

export function stop(runner) {
  runner.effect.stop();
}
