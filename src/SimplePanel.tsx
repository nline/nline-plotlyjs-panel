import React, { PureComponent } from 'react';
import { PanelProps,DataSourceApi  } from '@grafana/data';
import {getDataSourceSrv } from '@grafana/runtime'
import { SimpleOptions } from 'types';
import merge from 'deepmerge';
import _ from 'lodash';

// tslint:disable
import Plot from 'react-plotly.js';
// @ts-ignore
import Plotly from 'plotly.js/dist/plotly';
//declare plolty as global
declare global {
  interface Window {
    Plotly: any;
    updateVariable: any;
  }
}
window.Plotly = Plotly;

let dataSource:any = getDataSourceSrv() as unknown as DataSourceApi;
window.updateVariable=function(varname:string, path:string) {
  console.log('update variable', varname, path );
  let v = _.find(dataSource.templateSrv.variables, check => {
    return check.name === varname;
  });
  console.log(v);
  if(v) {
    v.variableSrv.setOptionAsCurrent(v, {
      text: path,
      value: path,
    });
    v.variableSrv.variableUpdated(v, true);
  }
}

interface Props extends PanelProps<SimpleOptions> {}

export class SimplePanel extends PureComponent<Props> {
  render() {
    console.log(this);
    console.log(this.props.replaceVariables('$distance'));
    //console.log(this.props.replaceVariables('$__to'+' '+'$__from'));
    
    console.log(dataSource.templateSrv.variables)
    //Get all variables
    const context = {
      interval: dataSource.templateSrv.builtIns.__interval.value,
    } as any;
    dataSource.templateSrv.variables.forEach((elt: any)=>{
      context[elt.name]=elt.current.text;
    })
    let parameters: any;
    //const NbValues = data.series[0].rows.length;

    try {
      if (this.props.options.script !== '') {
        var f = new Function('data,variables', this.props.options.script);
        parameters = f(this.props.data, context);
      }else{
        parameters = [this.props.options.data,this.props.options.layout,this.props.options.config];
      }
    } catch (e) {
      console.log(e);
    }

    const combineMerge = (target, source, options) => {
      const destination = target.slice()
    
      source.forEach((item, index) => {
        if (typeof destination[index] === 'undefined') {
          destination[index] = options.cloneUnlessOtherwiseSpecified(item, options)
        } else if (options.isMergeableObject(item)) {
          destination[index] = merge(target[index], item, options)
        } else if (target.indexOf(item) === -1) {
          destination.push(item)
        }
      })
      return destination
    }
    //Merge data field and data transformed by script
    /*let series: any[] = [];
    if (data2.length && data2.length > 0) {
      data2.forEach((serie, index) => {
        let options = this.props.options.data[index];
        series.push({
          ...options,
          ...data2[index],
        });
      });
    }*/

    console.log(merge(this.props.options.data,parameters.data,{ arrayMerge: combineMerge }));
    //let layout = { ...this.props.options.layout, autosize: true, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'transparent', height: this.props.height, title: this.props.options.title }
    let layout = { ...this.props.options.layout, autosize: true, height: this.props.height };
  
    return (
      <Plot
        style={{
          width: '100%',
          height: '100%',
        }}
        data={parameters.data?merge(this.props.options.data,parameters.data,{ arrayMerge: combineMerge }):this.props.options.data}
        onInitialized={(figure: any, graphDiv: any) => this.setState({ figure: figure, graphDiv: graphDiv })}
        //layout={ {autosize:true, height:this.props.height, title: this.props.options.title} }
        layout={parameters.layout?merge(layout,parameters.layout):layout}
        config={parameters.config?merge(this.props.options.config,parameters.config):this.props.options.config}
        useResizeHandler={true}
        onClick={data=>{
          //console.log(data)
          var f = new Function('data', this.props.options.onclick);
          f(data);
        }}
      ></Plot>
    );
  }
}
