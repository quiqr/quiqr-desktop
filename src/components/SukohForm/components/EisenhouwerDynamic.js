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

    this.cdata = {
      datasets: [{
        label: '',
        data: [],
      }]
    };
    this.state = {
      options: [],
      error_msg: null,
    }
  }

  componentDidMount(){
    let {context} = this.props;
    this.cdata = context.value;
  }

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
          data={this.cdata}

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
              dragData: {
                dragX: true,
                dragY: true,
//                onDrag(event, di, index, value) {},
                onDragEnd: (e, datasetIndex, index, value)=> {
                  this.handleChange(e);
                },
 //               onDragStart(event, di, index, value) {},
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
