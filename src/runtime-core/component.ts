import { shallowReadonly } from "../reactivity/reactive";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";
export function createComponentInstance(vnode) {
    const component = {
      vnode,
      type: vnode.type,
      setupState: {},
      slots:{},
      props:{}
    };
  
    return component;
  }
  
  export function setupComponent(instance) {
    // TODO
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
  }
  
  function setupStatefulComponent(instance: any) {
    const Component = instance.type;

    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
  
    const { setup } = Component;
  
    if (setup) {
      setCurrentInstance(instance);
      const setupResult = setup(shallowReadonly(instance.props));
      setCurrentInstance(null);
  
      handleSetupResult(instance, setupResult);
    }
  }
  
  function handleSetupResult(instance, setupResult: any) {
    // function Object
    // TODO function
    if (typeof setupResult === "object") {
      instance.setupState = setupResult;
    }
  
    finishComponentSetup(instance);
  }
  
  function finishComponentSetup(instance: any) {
    const Component = instance.type;
  
    // if (!Component.render) {
    //   instance.render = Component.render;
    // }
    instance.render = Component.render;
  }

  let currentInstance = null;

export function getCurrentInstance() {
  return currentInstance;
}

export function setCurrentInstance(instance) {
  currentInstance = instance;
}
  