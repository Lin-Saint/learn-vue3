import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  if (typeof vnode.type === 'string') {
    processElement(vnode,container)
  } else if(isObject(vnode.type)) {
    processComponent(vnode, container);
  }
  
}
function processElement(vnode:any, container: any) {
  const el = (vnode.el = document.createElement(vnode.type));
  const { children,props } = vnode;
  if (typeof children === 'string') {
    el.textContent = children
  } else if(Array.isArray(children)) {
    mountChildren(vnode,el)
  }
  for (const key in props) {
    el.setAttribute(key,props[key])
  }
  container.append(el)
}

function mountChildren(vnode:any, container:any) {
  vnode.children.forEach((vnode) => {
    patch(vnode, container);
  });
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

function mountComponent(initialVNode: any, container) {
  const instance = createComponentInstance(initialVNode);

  setupComponent(instance);
  setupRenderEffect(instance, initialVNode, container);
}

function setupRenderEffect(instance: any, initialVNode, container) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);

  patch(subTree, container);

  initialVNode.el = subTree.el;
}
