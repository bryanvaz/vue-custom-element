/**
 * Number and Boolean props are treated as strings
 * We should convert it so props will behave as intended
 * @param value
 * @returns {*}
 */
export function convertAttributeValue(value) {
  let propsValue = value;
  const isBoolean = ['true', 'false'].indexOf(value) > -1;
  const valueParsed = parseFloat(propsValue, 10);
  const isNumber = !isNaN(valueParsed) && isFinite(propsValue);

  if (isBoolean) {
    propsValue = propsValue === 'true';
  } else if (isNumber) {
    propsValue = valueParsed;
  }

  return propsValue;
}

/**
 * Extract props from component definition, no matter if it's array or object
 * @param component
 * @param Vue
 */
export function getProps(component, Vue) {
  const props = {
    camelCase: [],
    hyphenate: []
  };

  if (component.props && component.props.length) {
    component.props.forEach((prop) => {
      props.camelCase.push(Vue.util.camelize(prop));
    });
  } else if (component.props && typeof component.props === 'object') {
    for (const prop in component.props) { // eslint-disable-line no-restricted-syntax
      if ({}.prototype.hasOwnProperty.call(component.props, prop)) {
        props.camelCase.push(Vue.util.camelize(prop));
      }
    }
  }

  props.camelCase.forEach((prop) => {
    props.hyphenate.push(Vue.util.hyphenate(prop));
  });

  return props;
}

/**
 * If we get DOM node of element we could use it like this:
 * document.querySelector('widget-vue1').prop1 <-- get prop
 * document.querySelector('widget-vue1').prop1 = 'new Value' <-- set prop
 * @param element
 * @param props
 */
export function reactiveProps(element, props) {
  // Handle param attributes
  props.camelCase.forEach((name, index) => {
    Object.defineProperty(element, name, {
      get() {
        return this.__vue__[name];
      },
      set(value) {
        this.setAttribute(props.hyphenate[index], convertAttributeValue(value));
      }
    });
  });
}

/**
 * In root Vue instance we should initialize props as 'propsData'.
 * @param instanceOptions
 * @param props
 */
export function getPropsData(element, instanceOptions, props) {
  const propsData = instanceOptions.propsData || {};

  props.hyphenate.forEach((name, index) => {
    const value = element.attributes[name] && element.attributes[name].nodeValue;

    if (value !== '') {
      propsData[props.camelCase[index]] = convertAttributeValue(value);
    }
  });

  return propsData;
}