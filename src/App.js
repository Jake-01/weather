import React from 'react';
import './App.css';

export default class App extends React.Component {

constructor() {
    super();
    this.state = {
      temp: 'Awaiting data',
      rh: 'Awaiting data',
      ws: 'Awaiting data',
      wd: 'Awaiting data',
      averageWS: 'Awaiting data',
      HighestWS: 'Awaiting data',
      time: 'Awaiting data',
      timeSetup: 'Awaiting data',
      lat: '',
      long: ''
    };
    this.unsubscribe = null;
}

componentDidMount() {
  this.getData();
}



getData(){
  fetch(`http://192.168.10.50:4242/get_data/`).then(response => response.json())
      .then((data) =>{
        var today = new Date();
        var minutes = today.getMinutes()
        if (minutes < 10){
          minutes = '0' + minutes
        }
        var time = today.getHours() + ":" + minutes
        this.setState({time: time});
        for (let x = 0; x < data.length; x++) {
          var ws = data[x][3]*3.6;
          var averageWS =  data[x][7]*3.6;
          var HighestWS =  data[x][6]*3.6;
          var wd = this.degToCard(data[x][2])
          this.setState({
            temp: data[x][0],
            rh: data[x][1],
            wd: wd + ' - ' + data[x][2],
            ws: ws,
            lat: data[x][4],
            long: data[x][5],
            averageWS: averageWS,
            HighestWS: HighestWS,
            timeSetup: data[x][8]
          });
          }
        setTimeout(() => {
          this.getData();
        }, 1000 )
        })
      .catch(e=>{
      console.log(e);
      })
    };

componentWillUnmount() {
    this.unsubscribe();
}


degToCard(deg){
  if (deg>11.25 && deg<33.75){
    return "NNE";
  }else if (deg>33.75 && deg<56.25){
    return "ENE";
  }else if (deg>56.25 && deg<78.75){
    return "E";
  }else if (deg>78.75 && deg<101.25){
    return "ESE";
  }else if (deg>101.25 && deg<123.75){
    return "ESE";
  }else if (deg>123.75 && deg<146.25){
    return "SE";
  }else if (deg>146.25 && deg<168.75){
    return "SSE";
  }else if (deg>168.75 && deg<191.25){
    return "S";
  }else if (deg>191.25 && deg<213.75){
    return "SSW";
  }else if (deg>213.75 && deg<236.25){
    return "SW";
  }else if (deg>236.25 && deg<258.75){
    return "WSW";
  }else if (deg>258.75 && deg<281.25){
    return "W";
  }else if (deg>281.25 && deg<303.75){
    return "WNW";
  }else if (deg>303.75 && deg<326.25){
    return "NW";
  }else if (deg>326.25 && deg<348.75){
    return "NNW";
  }else{
    return "N";
  }
}

resetAverage(){
  fetch(`http://192.168.10.50:4242/reset_average/`).then(response => response.text())
      .then((data) =>{
        console.log(data)
        })
      .catch(e=>{
      console.log(e);
      })
}

resetHighestWS(){
  fetch(`http://192.168.10.50:4242/reset_highestWS/`).then(response => response.text())
      .then((data) =>{
        console.log(data)
        })
      .catch(e=>{
      console.log(e);
      })
}

render() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Current Time: {this.state.time}
        </p>
        <p>
          Temp: {this.state.temp}&#8451;
        </p>
        <p>
          Relative Humidity: {this.state.rh}%
        </p>
        <p>
          Wind Direction: {this.state.wd} &#176;
        </p>
        <p>
          Wind Speed: {this.state.ws} Km/Hr
        </p>
        <p>
          Average Wind Speed: {this.state.averageWS} Km/Hr
        </p>
        <p>
          Highest Gust: {this.state.HighestWS} Km/Hr
        </p>
        <p>
          Time of setup: {this.state.timeSetup}
        </p>
        <button onClick={() => {this.resetAverage()}}>
          Clear Average
        </button>
        <button onClick={() => {this.resetHighestWS()}}>
          Clear Highest windspeed
        </button>
      </header>
    </div>
  );
}
}
