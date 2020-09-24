import React from 'react';
import './App.css';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

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
      long: '',
      firstLoad: true,
      forecastData: [],
      forecastDate: '',
    };
    this.unsubscribe = null;
}

componentDidMount() {
  this.getData();
}



getData(){
  fetch(`http://localhost:4242/get_data/`).then(response => response.json())
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
          if (this.state.firstLoad == true ){
            if (this.state.lat != 0 && this.state.long != 0){
              console.log('Getting forecast')
              this.getWeatherLocation(this.state.lat, this.state.long);
              this.setState({
                firstLoad: false,
              })
            }
            else if (this.state.lat == 0 || this.state.long == 0){
              console.log('No GPS data avaible')
              this.setState({
                forecastDate: 'GPS data unavailable - Cannot fetch weather forecast'
              })
            }
          }
        setTimeout(() => {
          this.getData();
        }, 1000 )
        })
      .catch(e=>{
        this.setState({
          err: 'An error has occured, data cannot be fetched for weather station',
          err1: 'An error has occured, data cannot be fetched for weather station',
        })
      console.log(e);
      })
    };

getWeatherLocation(lat, long){
  var weatherLocURL = "http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=aafMn9VAtShBsZe06jiLgdAXvaxhOFS3&q=" + lat + "%2C" + long;
  console.log(weatherLocURL)
  fetch(weatherLocURL).then(response => response.json())
      .then((data) =>{
        var locationKey = data.Key;
        console.log(data);
        console.log(locationKey);
        this.getWeatherForecast(locationKey);
        this.setState({
          location: data.LocalizedName
        })
        })
      .catch(e=>{
        this.setState({
          err1: 'An error has occured, location could not be acquired from accuweather'
        })
      console.log(e);
      })
    };

getWeatherForecast(Key){
  var weatherForecastURL = "http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/"+Key+"?apikey=aafMn9VAtShBsZe06jiLgdAXvaxhOFS3&details=true&metric=true"
  console.log(weatherForecastURL)
  fetch(weatherForecastURL).then(response => response.json())
      .then((data) =>{
        var dateHolder = data[0].DateTime;
        var dateHolder = dateHolder.split('+');
        var date = dateHolder[0].replace('T', ' ')
        this.setState({
          forecastData: data,
          forecastDate: date
        })
        console.log(data);
        })
      .catch(e=>{
        this.setState({
          err1: 'An error has occured, forecast could not be fetched from accuweather'
        })
      console.log(e);
      })
    };


componentWillUnmount() {
    this.unsubscribe();
};

reduceTime(DateTime){
  var x = DateTime.split('T');
  var y = x[1]
  console.log(y)
  var y = y.split('+');
  var y = y[0].split(':')
  var z = y[0]+ ':' +y[1]
  return z;
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
};

resetAverage(){
  fetch(`http://localhost:4242/reset_average/`).then(response => response.text())
      .then((data) =>{
        console.log(data)
        })
      .catch(e=>{
      console.log(e);
      })
}

resetHighestWS(){
  fetch(`http://localhost:4242/reset_highestWS/`).then(response => response.text())
      .then((data) =>{
        console.log(data)
        })
      .catch(e=>{
      console.log(e);
      })
}

openMap(){
  var mapURL = "https://www.google.com/maps/search/?api=1&query=" + this.state.lat + ',' + this.state.long;
  window.open(mapURL, "_blank")
}

refreshForecast(){
  this.getWeatherLocation(this.state.lat, this.state.long);
}

highlight(x){

}

render() {
  return (
    <div className="App">
      <header className="App-header" style={{'padding-top': 20}}>
        <Tabs>
          <TabList>
            <Tab>Weather</Tab>
            <Tab>Forecast</Tab>
          </TabList>

          <TabPanel style={{"min-width":"500px"}}>
            <div>
              {this.state.err}
            </div>
            <div className='wrapper'>
              <div className='col-1'>Current Time: </div>
              <div className='col-1'> {this.state.time} </div>
            </div>
            <div className='wrapper'>
              <div className='col-1'>Temp: </div>
              <div className='col-1'> {this.state.temp}&#8451; </div>
            </div>
            <div className='wrapper'>
              <div className='col-1'>Relative Humidity: </div>
              <div className='col-1'>  {this.state.rh}% </div>
            </div>
            <div className='wrapper'>
              <div className='col-1'>Wind Direction: </div>
              <div className='col-1'> {this.state.wd} &#176; </div>
            </div>
            <div className='wrapper'>
              <div className='col-1'>Wind Speed: </div>
              <div className='col-1'> {this.state.ws} Km/Hr </div>
            </div>
            <div className='wrapper'>
              <div className='col-1'>Average Wind Speed: </div>
              <div className='col-1'> {this.state.averageWS} Km/Hr </div>
            </div>
            <div className='wrapper'>
              <div className='col-1'>Highest Gust: </div>
              <div className='col-1'> {this.state.HighestWS} Km/Hr </div>
            </div>
            <div className='wrapper'>
              <div className='col-1'>Time of setup: </div>
              <div className='col-1'> {this.state.timeSetup} </div>
            </div>
            <button className="button" onClick={() => {this.resetAverage()}}>
              Clear Average
            </button>
            <button className="button" onClick={() => {this.resetHighestWS()}}>
              Clear Highest windspeed
            </button>
            <button className="button" onClick={() => {this.openMap()}}>
              Google maps
            </button>
          </TabPanel>
          <TabPanel style={{"min-width":"1400px"}}>
            <div>
              {this.state.err1}
            </div>
            <p >Weather Forecast for Lat: {this.state.lat} Long: {this.state.long}  - {this.state.location} </p>
            <p>Period: {this.state.forecastDate} </p>
            <div >
              {this.state.forecastData.map((forecast, index) => (
                <div key={index} className="wrapper" onClick={() =>{this.highlight(index)}}>
                  <div className="col">Time: {this.reduceTime(forecast.DateTime)}</div>
                  <div className="col">Temp: {forecast.Temperature.Value}&#8451;</div>
                  <div className="col-2">Wind: {forecast.Wind.Speed.Value} Km/Hr {forecast.Wind.Direction.Localized}</div>
                  <div className="col-2"> Gusting: {forecast.WindGust.Speed.Value} Km/Hr</div>
                  <div className="col">Rain: {forecast.Rain.Value}mm</div>
                  <div className="col">RH: {forecast.RelativeHumidity}%</div>
                </div>
              ))}
            </div>
            <button className="button" onClick={() => {this.refreshForecast()}}>
              Update Forecast
            </button>
          </TabPanel>
        </Tabs>

      </header>
    </div>
  );
}
}
