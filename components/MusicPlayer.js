import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Linking } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { Card, Title, Paragraph, IconButton } from 'react-native-paper'; // Import IconButton component from react-native-paper

const LASTFM_API_KEY = '66c1d97c6844c347b53dad0419d5f3ee';

const MusicPlayer = () => {
  const [location, setLocation] = useState(null);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    (async () => {
      console.log("Requesting location permissions...");
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      console.log("Fetching current location...");
      try {
        const location = await Location.getCurrentPositionAsync({});
        console.log('Location obtained:', location);
        const { latitude, longitude } = location.coords;
        setLocation({ latitude, longitude });
        fetchCountryName(latitude, longitude);
      } catch (error) {
        console.error('Error fetching location:', error);
        Alert.alert('Error fetching location');
      }
    })();
  }, []);

  const fetchCountryName = async (latitude, longitude) => {
    try {
      console.log(`Fetching country for coordinates: ${latitude}, ${longitude}`);
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'jsonv2',
        }
      });
      console.log('Nominatim API Response:', response.data);

      const country = response.data.address?.country;
      if (country) {
        fetchSongs(country);
      } else {
        Alert.alert('Failed to fetch country name');
      }
    } catch (error) {
      console.error('Error fetching country name:', error);
      Alert.alert('Error fetching country name');
    }
  };

  const fetchSongs = async (country) => {
    try {
      console.log(`Fetching songs for country: ${country}`);
      const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
        params: {
          method: 'geo.gettoptracks',
          country: country,
          api_key: LASTFM_API_KEY,
          format: 'json'
        }
      });
      console.log('Songs API Response:', response.data);
      setSongs(response.data.tracks.track);
    } catch (error) {
      console.error('Error fetching songs:', error);
      Alert.alert('Error fetching songs');
    }
  };

  const playSong = async (songName, artistName, url) => {
    try {
      console.log(`Redirecting to: ${url}`);
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error redirecting:', error);
      Alert.alert('Error redirecting');
    }
  };

  console.log('Current location:', location);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Popular Songs Near You</Text>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.url}
        renderItem={({ item }) => (
          <Card>
            {/* Customize the card content as per your requirement */}
            <Card.Content>
              <Title>
                <Text>{item.name}</Text>
              </Title>
              <Paragraph>
                <Text>{item.artist.name}</Text>
              </Paragraph>
            </Card.Content>
            <Card.Actions>
              <IconButton icon="play" onPress={() => playSong(`${item.name}`, `${item.artist.name}`, `${item.url}`)} />
            </Card.Actions>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default MusicPlayer;
