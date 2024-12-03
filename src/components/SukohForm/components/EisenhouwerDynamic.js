import React           from 'react';
import FormItemWrapper from './shared/FormItemWrapper';
import { BaseDynamic } from '../../HoForm';
import Tip             from '../../Tip';
import { Chart as ChartJS, PointElement, Tooltip, Legend, registerables } from 'chart.js';
import "chartjs-plugin-dragdata";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Bubble } from "react-chartjs-2";
import service                  from '../../../services/service';


const arrayToObject = (array, keyField) =>
  array.reduce((obj, item) => {
    obj[item[keyField]] = item
    //delete obj[item[keyField]][keyField]

    return obj
  }, {})


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

const emptyDataSet = {
      datasets: [{
        label: '',
        data: [],
      }]
    };


class EisenhouwerDynamic extends BaseDynamic {

  constructor(props){

    super(props);

    this.cdata = emptyDataSet;

    this.state = {
      error_msg: null,
    }
  }

  getType(){
    return 'eisenhouwer';
  }

/*

# #   dataSetsPath: .
# #   dataSetsKeyToLabel: true
 #   dataSetsDataPointsPath: data
# #   dataSetsDataPointsKeyToItem: true
 #   dataSetsDataPointPosXPath: .REPORT.importance_number_of_100
 #   dataSetsDataPointPosyPath: .REPORT.cost_number_of_100

    dataSetsDataPointLabelTemplate: "(%s) %s - %s"
    dataSetsDataPointLabelVars: [ ".Risk", ".RiskCode", ".QuestionTitle" ]
  */

  inParsePoints(newPData, field){

    let points = [];
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
      point.x = eval("point"+(field.dataSetsDataPointPosXPath||""))
      point.y = eval("point"+(field.dataSetsDataPointPosYPath||""))
      return point
    });
    return points;

  }

  createNestedObject( base, names ) {
    for( let i = 0; i < names.length; i++ ) {
      base = base[ names[i] ] = base[ names[i] ] || {};
    }
  }

  inParseDataSets(data, field){

    let newData = eval("data"+(field.dataSetsPath||""))

    let rdatasets = [];
    if(field.dataSetsKeyToLabel){
      rdatasets = Object.keys(newData).map(key => {
        let newPData = eval("newData[key]"+(field.dataSetsDataPointsPath||""))
        return { label: key, data: this.inParsePoints(newPData,field) }
      })
    }
    else{
      rdatasets = newData.map((item)=>{
        let newPData = eval("item"+(field.dataSetsDataPointsPath||""))
        item.data = this.inParsePoints(newPData,field);

        return item;
      });
    }

    return {datasets: rdatasets};
  }

  outParseDataSets(incdata,field){

    let cdata = incdata;

    let dsets = [];
    if(field.dataSetsDataPointsKeyToItem){
      cdata.datasets.forEach((dsitem) => {
        let ppdata0 = {};
        //let ppdata00 = dsitem
        //delete ppdata00.data
        ppdata0.data = arrayToObject(dsitem.data, "_label");
        ppdata0.label = dsitem.label;

        //ppdata0 = {...ppdata00, ...ppdata01 }

        dsets.push(ppdata0);
      })

      cdata.datasets = dsets;
    }

    //dsets = cdata.datasets;
    dsets =[];
    cdata.datasets.forEach((dsitem) => {

      let ppdata = {};
      if(field.dataSetsDataPointsPath){
        this.createNestedObject(ppdata, field.dataSetsDataPointsPath.substring(1).split('.') );

        let data = dsitem.data
        delete dsitem.data
        ppdata = dsitem;

        eval("ppdata"+field.dataSetsDataPointsPath + " = data" )
      }
      else{
        //ppdata = dsitem.data
        //ppdata.label = dsitem.label
      }
      dsets.push(ppdata);
    })

    cdata.datasets = dsets;

    //fixme make local
    this.rdata = {};//cdata

    if(field.dataSetsPath){
      this.createNestedObject(this.rdata, field.dataSetsPath.substring(1).split('.') );
      eval("this.rdata"+field.dataSetsPath + " = cdata.datasets" );
    }
    else{
      //this.rdata = {...cleancdata, ...cdata.datasets}
      this.rdata = cdata.datasets
      //service.api.logToConsole(this.cdata.label)
    }

    if(field.dataSetsKeyToLabel){
      let tmpdata = this.rdata;
      //this.rdata = arrayToObject(tmpdata, "label");
    }


    return this.rdata;
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


  handleChange(field){


    let cdataOut = this.outParseDataSets(this.cdata, field);

    //service.api.logToConsole(cdataOut)


     //this.props.context.setValue(this.cdata, 250);
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
                  text: field.xScaleTitle
                }
              },
              y: {
                min: 0,
                max: 100,
                title: {
                  display: true,
                  text: field.yScaleTitle
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
