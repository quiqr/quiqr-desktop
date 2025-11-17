import { BaseDynamic } from '../../HoForm';
import type { FieldBase, BaseDynamicProps, BaseDynamicState } from '../../HoForm';

interface HiddenDynamicField extends FieldBase {
  default?: string;
}

type HiddenDynamicProps = BaseDynamicProps<HiddenDynamicField>;

type HiddenDynamicState = BaseDynamicState;

class HiddenDynamic extends BaseDynamic<HiddenDynamicProps, HiddenDynamicState> {

  normalizeState({state, field}: {state: any, field: HiddenDynamicField}){
    let key = field.key;
    if(state[key]===undefined){
      state[key] = field.default || '';
    }
  }

  getType(){
    return 'hidden';
  }

  renderComponent(){
    return null;
  }
}

export default HiddenDynamic;
