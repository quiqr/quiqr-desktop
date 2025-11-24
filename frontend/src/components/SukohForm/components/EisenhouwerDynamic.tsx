import React           from 'react';
import FormItemWrapper from './shared/FormItemWrapper';
import { BaseDynamic, BaseDynamicProps, BaseDynamicState, FieldBase } from '../../HoForm';
import Tip             from '../../Tip';
import { Chart as ChartJS, PointElement, Tooltip, Legend, registerables } from 'chart.js';
import "chartjs-plugin-dragdata";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Bubble } from "react-chartjs-2";
//import service                  from '../../../services/service';

// Define field interface with all properties used by the component
export interface EisenhouwerDynamicField extends FieldBase {
  title?: string;
  tip?: string;
  dataSetsDataPointsKeyToItem?: boolean;
  dataSetsDataPointPosXPath?: string;
  dataSetsDataPointPosYPath?: string;
  dataSetsPath?: string;
  dataSetsKeyToLabel?: boolean;
  dataSetsDataPointsPath?: string;
  xScaleTitle?: string;
  yScaleTitle?: string;
  pointRadius?: number;
  labelDoNow?: string;
  labelToPlan?: string;
  labelDelegate?: string;
  labelDelete?: string;
  dataSetsDataPointLabelTemplate?: string;
}

// Define quadrants plugin options interface
interface qdtOptions {
  topLeft: string;
  topRight: string;
  bottomRight: string;
  bottomLeft: string;
}

type EisenhouwerDynamicProps = BaseDynamicProps<EisenhouwerDynamicField>;

type EisenhouwerDynamicState = BaseDynamicState & {
  error_msg: string | null;
};

const arrayToObject = (arrayIn: any[], keyField: string) => {
    return arrayIn.reduce((obj, item) => {
      obj[item[keyField]] = item

      return obj
    }, {} as Record<string, any>)
  }

const quadrants = {
  id: 'quadrants',

  beforeDraw(chart: any, _args: any, options: qdtOptions) {
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
  ChartDataLabels,
  PointElement,
  Tooltip,
  quadrants,
  annotationPlugin,
  Legend,
  ...registerables
);

const emptyDataSet = {
      datasets: [{
        label: '',
        data: [],
      }]
    };


class EisenhouwerDynamic extends BaseDynamic<EisenhouwerDynamicProps, EisenhouwerDynamicState> {
  cdata: any;

  constructor(props: EisenhouwerDynamicProps){

    super(props);

    this.cdata = emptyDataSet;

    this.state = {
      error_msg: null,
    }
  }

  getType(){
    return 'eisenhouwer';
  }

  inParsePoints(newPData: any, field: EisenhouwerDynamicField){

    let points: any[] = [];
    if(field.dataSetsDataPointsKeyToItem) {
      points = Object.keys(newPData).map(key => {
        let rval = newPData[key]
        rval._label = key
        return rval
      })
    }
    else{
      points = newPData;
    }

    points.map((point)=>{
      // eslint-disable-next-line
      point.x = eval("point"+(field.dataSetsDataPointPosXPath||""))
      // eslint-disable-next-line
      point.y = eval("point"+(field.dataSetsDataPointPosYPath||""))
      return point
    });
    return points;
  }

  createNestedObject( base: any, names: string[] ) {
    for( let i = 0; i < names.length; i++ ) {
      base = base[ names[i] ] = base[ names[i] ] || {};
    }
  }

  inParseDataSets(data: any, field: EisenhouwerDynamicField){

    // eslint-disable-next-line
    let newData = eval("data"+(field.dataSetsPath||""))

    let rdatasets: any[] = [];
    if(field.dataSetsKeyToLabel){
      rdatasets = Object.keys(newData).map(key => {
        // eslint-disable-next-line
        let newPData = eval("newData[key]"+(field.dataSetsDataPointsPath||""))
        return { label: key, data: this.inParsePoints(newPData,field) }
      })
    }
    else{
      rdatasets = newData.map((item: any)=>{
        // eslint-disable-next-line
        let newPData = eval("item"+(field.dataSetsDataPointsPath||""))
        item.data = this.inParsePoints(newPData,field);

        return item;
      });
    }

    return {datasets: rdatasets};
  }

  componentDidMount(){
    let {context} = this.props;
    let {node} = context;
    let {field} = node;

    let cdata = emptyDataSet;
    if(context.value){
      cdata = this.inParseDataSets(context.value, field)
    }

    this.cdata = cdata;
  }

  outParsePoints(points: any[], field: EisenhouwerDynamicField){

    points.map((point)=>{
      if(field.dataSetsDataPointPosXPath){
        // eslint-disable-next-line
        eval("point"+(field.dataSetsDataPointPosXPath+"=point.x"))
      }
      if(field.dataSetsDataPointPosYPath){
        // eslint-disable-next-line
        eval("point"+(field.dataSetsDataPointPosYPath+"=point.y"))
      }
      return point
    });
    return points;
  }

  outParseDataSets(cdata: any, field: EisenhouwerDynamicField){

    let cdataIn = { ...cdata }
    let cdataOut: any = {}

    if(field.dataSetsKeyToLabel){
      let dsets: Record<string, any> = {}

      cdataIn.datasets = arrayToObject(cdataIn.datasets, "label");

      if(field.dataSetsDataPointsKeyToItem){

        Object.keys(cdataIn.datasets).forEach((key) => {

          let tmpData = this.outParsePoints(cdataIn.datasets[key].data, field)
          tmpData = arrayToObject(tmpData, "_label");

          dsets[key] = {}

          if(field.dataSetsDataPointsPath){
            dsets[key][field.dataSetsDataPointsPath.substring(1)] = tmpData;
          }
          else{
            dsets[key] = tmpData;
          }
        })
      }

      if(field.dataSetsPath){
        cdataIn[field.dataSetsPath.substring(1)] = dsets;
      }
      else{
        cdataIn = dsets
      }
      cdataOut = cdataIn;
    }
    else {

        let dsets: any[] = []

        cdataIn.datasets.forEach((ds: any) => {

          let newDs: any = {}
          if(field.dataSetsDataPointsPath){
            newDs[field.dataSetsDataPointsPath.substring(1)] = ds.data
          }
          else{
            newDs = ds.data
          }

          dsets.push(newDs)
        })

        if(field.dataSetsPath){
          cdataOut[field.dataSetsPath.substring(1)] = dsets;
        }
        else{
          cdataOut = dsets;
        }
    }

    return cdataOut;
  }

  handleChange(field: EisenhouwerDynamicField){
    this.props.context.setValue(this.outParseDataSets(this.cdata, field), 250);
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
                  text: field.xScaleTitle,
                  font: {
                    size: 26,
                    weight: 'bold'
                  }

                }
              },
              y: {
                min: 0,
                max: 100,
                title: {
                  display: true,
                  text: field.yScaleTitle,
                  font: {
                    size: 26,
                    weight: 'bold'
                  }
                }
              },
            },
            elements: {
              point:{
                radius: (field.pointRadius || 5)
              },
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
                    xValue: 10,
                    yValue: 95,
                    content: [(field.labelDoNow||"DO NOW")],
                    color: '#bcc0c0',
                    font: {
                      size: 26,
                      weight: "bold"
                    }
                  },
                  label2: {
                    type: 'label',
                    xValue: 89,
                    yValue: 95,
                    content: [(field.labelToPlan||"TO PLAN")],
                    color: '#bcc0c0',
                    font: {
                      size: 26,
                      weight: "bold"
                    }
                  },
                  label3: {
                    type: 'label',
                    xValue: 11,
                    yValue: 3,
                    content: [(field.labelDelegate||"DELEGATE")],
                    color: '#bcc0c0',
                    font: {
                      size: 26,
                      weight: "bold"
                    }
                  },
                  label4: {
                    type: 'label',
                    xValue: 90,
                    yValue: 3,
                    content: [(field.labelDelete||"DELETE")],
                    color: '#bcc0c0',
                    font: {
                      size: 26,
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
                formatter: (point, context) => {
                  let label = `${point.x}, ${point.y}`
                  if(field.dataSetsDataPointLabelTemplate){
                    // eslint-disable-next-line
                    eval("label=`"+field.dataSetsDataPointLabelTemplate+"`")
                  }
                  else{
                    label=`x=${point.x}, y=${point.y}`

                  }
                  return label;
                }
              },
              dragData: {
                dragX: true,
                dragY: true,
                onDragEnd: (e, datasetIndex, index, value)=> {
                  this.handleChange(field);
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
