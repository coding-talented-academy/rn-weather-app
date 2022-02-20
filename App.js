import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, ScrollView, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { API_KEY, WEEKDAYS, MONTHS } from './StaticObject';

const {width : SCREEN_WIDTH}= Dimensions.get("window");

export default function App() {

  useEffect(()=>{
    getToday()
    getLocation()
  },[])

  const [dateData, setDateData ]= useState({
    weekday : '',
    date : '',
    month : ''
  })
  const [cityName, setCityName] = useState("")
  const [temp, setTemp] = useState("")
  const [weather, setWeather] = useState({
    text : '',
    icon : ''
  })
  const [forecasts, setForcasts] = useState(null)

  const getLocation = async () => {
    let { granted } = await Location.requestForegroundPermissionsAsync();
    if(!granted){
      alert("Permission for location denied!")
      return
    }
    
    const {coords : {latitude, longitude}} = await Location.getCurrentPositionAsync({accuracy : 5})
      
    getLocationWeatherInfo(latitude, longitude)
    getForecast(latitude, longitude)
  } 

  const getForecast = async (latitude, longitude) => {
    const excludePart = "current,minutely,daily,alerts"
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=${excludePart}&appid=${API_KEY}&units=metric`

    await fetch(url)
            .then((response)=>response.json())
            .then(({hourly})=>{
              const data = hourly.slice(0, 12)
              setForcasts(data)
            })
  }

  const getLocationWeatherInfo = async (latitude, longitude) => {
    // city name , temperature, weather
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    
    await fetch(url)
              .then((response)=>response.json())
              .then(({name, main : {temp}, weather})=>{
                setCityName(name)
                setTemp(parseFloat(temp).toFixed(1))
                setWeather({text : weather[0].main , icon : weather[0].icon})
              })
  }

  const getToday = () => {
    const today = new Date()

    const month = MONTHS[today.getMonth()]
    const date = today.getDate()
    const weekday = WEEKDAYS[today.getDay()]
    
    setDateData({
      weekday : weekday,
      date : date,
      month : month
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.cityBox}>
        <Text style={styles.cityName}>{cityName}</Text>
      </View>
      
      <View style={styles.dateBox}>
        <Text style={styles.weekday}>{dateData.weekday}</Text>
        <Text style={styles.date}>{`${dateData.date} ${dateData.month}`}</Text>
      </View>


      <View style={{ borderBottomColor : 'black', borderBottomWidth : 1, marginHorizontal : 20}}></View>

      <View style={styles.weatherBox}>
        <Text style={styles.temp}>{`${temp}°`}</Text>
        <Text style={styles.weather}>{weather.text}</Text>
        <Image source={{uri : `http://openweathermap.org/img/wn/${weather.icon}@2x.png`}} style={{width : 50, height : 50}}></Image>
      </View>

      <View style={{ borderBottomColor : 'black', borderBottomWidth : 1, marginHorizontal : 20}}></View>

      <ScrollView
        pagingEnabled
        horizontal>
           
         {forecasts && forecasts.length > 0 && forecasts.map((forecast, index)=>

            <View key={index} style={styles.forecastBox}>
                <Text style={styles.forecastTemp}>{`${forecast.temp}°`}</Text>
                <Text style={styles.wind}>{`${forecast.wind_speed} km/h Wind`}</Text>
            </View>
         )}
        
       
        </ScrollView>
      
      <StatusBar color></StatusBar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex : 1,
    backgroundColor : '#fed500'
  },
  //box
  cityBox : {
    flex : 0.5,
    justifyContent : 'center',
    alignItems : 'center'
  },
  dateBox : {
    flex : 1,
    justifyContent : 'center',
    paddingStart : 20
  },
  weatherBox : {
    flex : 2,
    paddingStart : 20,
    justifyContent : 'center',
  },
  forecastBox : {
    flex : 1,
    paddingHorizontal : 20,
    flexDirection : 'row',
    justifyContent : 'space-between',
    alignItems : 'center',
    width : SCREEN_WIDTH
  },

  //text
  cityName : {
    fontSize : 25,
    marginTop : 20
  },
  weekday : {
    fontSize : 25,
    fontWeight : 'bold'
  },
  date : {
    fontSize : 25
  },
  temp : {
    fontSize : 150,
    fontWeight : 'bold' 
  },
  weather : {
    fontSize : 25
  },
  forecastTemp : {
    fontSize : 15,
    fontWeight : 'bold'
  },
  wind : {
    fontSize : 15,
    fontWeight : 'bold'
 }
});