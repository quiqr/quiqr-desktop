import React           from 'react';
import FormItemWrapper from './shared/FormItemWrapper';
import { BaseDynamic } from '../../HoForm';
import Tip             from '../../Tip';
import service                  from '../../../services/service';


import {
  Chart as ChartJS,
  PointElement,
  Tooltip,
  Legend,
//  Colors,
  registerables
} from 'chart.js';

import "chartjs-plugin-dragdata";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';

import { Bubble, getDatasetAtEvent } from "react-chartjs-2";

const quadrants = {
  id: 'quadrants',

  beforeDraw(chart:any, args:any, options: qdtOptions) {
    const {
      ctx,
      chartArea: {left, top, right, bottom},
      scales: {x, y}} = chart;

    const midX = x.getPixelForValue(50);
    const midY = y.getPixelForValue(50);

    ctx.save();
    ctx.fillStyle = options.topLeft;
    ctx.fillRect(left, top, midX - left, midY - top);

    ctx.fillStyle = options.topRight;
    ctx.fillRect(midX, top, right - midX, midY - top);
    ctx.fillStyle = options.bottomRight;
    ctx.fillRect(midX, midY, right - midX, bottom - midY);
    ctx.fillStyle = options.bottomLeft;
    ctx.fillRect(left, midY, midX - left, bottom - midY);
    ctx.restore();
  }
};

ChartJS.register(
  //Colors,
  ChartDataLabels,
  PointElement,
  Tooltip,
  quadrants,
  annotationPlugin,
  Legend,
  ...registerables
);


class EisenhouwerDynamic extends BaseDynamic {

  constructor(props){

    super(props);
    this.selectorRef = React.createRef(null);

    this.cdata = {
      datasets: [{
        label: 'First Dataset',
        data: [{
          x: 20,
          y: 30,
          r: 15
        }, {
            x: 40,
            y: 10,
            r: 10
          }],
        backgroundColor: 'rgb(255, 99, 132)'
      }]
    };
    this.state = {
      options: [],
      error_msg: null,

      data: {
        datasets: [{
          label: 'First Dataset',
          data: [{
            x: 20,
            y: 30,
            r: 15
          }, {
              x: 40,
              y: 10,
              r: 10
            }],
          backgroundColor: 'rgb(255, 99, 132)'
        }]
      }

    }

  }

  componentDidMount(){
    //let {context} = this.props;
  }

  /*
  normalizeState({state, field}){
    //TODO: clear if value is not a valid option
    let key = field.key;
    let isArrayType = field.multiple===true;
    if(state[key]===undefined){
      state[key] = field.default || isArrayType?[]:'';
    }
    else{
      if(isArrayType && !Array.isArray(state[key])){
        state[key] = [state[key].toString()];
      }
      else if(!isArrayType && typeof(state[key])!=='string'){
        state[key] = state[key].toString();
      }
    }
  }
*/

  getType(){
    return 'eisenhouwer';
  }

  handleChange(event){
     this.props.context.setValue(this.cdata, 250);
  }

  renderComponent(){

    let {context} = this.props;
    let {node, currentPath, parentPath} = context;
    let {field} = node;

    if(currentPath!==parentPath){
      return (null);
    }

    let iconButtons = [];
    if(field.tip) iconButtons.push(<Tip markdown={field.tip} />);


    return (<FormItemWrapper
      control={

        <Bubble
          ref={ this.selectorRef }
          data={this.cdata}
          /*
          onClick={(event)=>{
            this.handleChange(event);

          }}
          */

          options={{
            scales: {
              x: {
                type: "linear",
                min: 0,
                max: 100,
                title: {
                  display: true,
                  text: "Cost of Solution"
                }
              },
              y: {
                min: 0,
                max: 100,
                title: {
                  display: true,
                  text: "Impact of Solution"
                }
              },
            },
            elements: {
              line: {
                fill: false,
                tension: 0.4
              }
            },
            layout: {
              padding: {
                top: 32,
                right: 16,
                bottom: 16,
                left: 8
              }
            },
            plugins: {
              tooltip: {
                enabled: false
              },
              colors: {
                enabled: true
              },

              annotation: {
                annotations: {
                  label1: {
                    type: 'label',
                    xValue: 5,
                    yValue: 95,
                    content: ['DO NOW'],
                    font: {
                      size: 16,
                      weight: "bold"
                    }
                  },
                  label2: {
                    type: 'label',
                    xValue: 95,
                    yValue: 95,
                    content: ['TO PLAN'],
                    font: {
                      size: 16,
                      weight: "bold"
                    }
                  },
                  label3: {
                    type: 'label',
                    xValue: 6,
                    yValue: 3,
                    content: ['DELEGATE'],
                    font: {
                      size: 16,
                      weight: "bold"
                    }
                  },
                  label4: {
                    type: 'label',
                    xValue: 96,
                    yValue: 3,
                    content: ['DELETE'],
                    font: {
                      size: 16,
                      weight: "bold"
                    }
                  }
                }
              },
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              quadrants: {
                topLeft: "#ffe3e8",
                topRight: "#fff6e0",
                bottomRight: "#def3f3",
                bottomLeft: "#daeefb"
              },
              datalabels: {
                borderRadius: 4,
                offset: 6,
                anchor: 'center',
                align: 'right',
                xformatter: function(value, context) {
                  if(value.RiskCode) return value.RiskCode + " - " + value.QuestionTitle;
                }
              },
                  animation: {
      onComplete: ctx => {
        console.log(ctx.chart.data.datasets);
        console.log(ctx.chart.options.scales.x);
      }
    },
              dragData: {
                dragX: true,
                dragY: true,
                onDrag(event, di, index, value) {
                  //console.log("drag", { event, di, index, value });
                },
                onDragEnd: (e, datasetIndex, index, value)=> {
                  // you may use this callback to store the final datapoint value
                  // (after dragging) in a database, or update other UI elements that
                  // dependent on it
                  this.handleChange(e);
                },
                         onDragStart(event, di, index, value) {
                  //console.log("drag start", { event, di, index, value });
                },
              },
            },
          }}


        />


      }
      iconButtons={iconButtons}
    />);
  }


}

export default EisenhouwerDynamic;
