import React, { useState, useEffect } from 'react';
import db from '../firebase';

const TraineePage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  const sports = [
    'Soccer',
    'Basketball',
    'Tennis',
    'Swimming',
    'Yoga',
    'Gymnastics',
    'Martial Arts',
    'Running',
    'Cycling',
    'CrossFit',
  ];

  const cities = [
    'New York',
    'Los Angeles',
    'Chicago',
    'Houston',
    'Phoenix',
    'Philadelphia',
    'San Antonio',
    'San Diego',
    'Dallas',
    'San Jose',
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      const snapshot = await db.collection('events').get();
      const fetchedEvents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEvents(fetchedEvents);
    };

    fetchEvents();
  }, []);

  const handleSearch = () => {
    setSearchPerformed(true);
    let filtered = events.filter((event) => {
      return (
        (selectedActivity === '' || event.activity === selectedActivity) &&
        (selectedCity === '' || event.city === selectedCity)
      );
    });
    setFilteredEvents(filtered);
    setSelectedActivity('');
    setSelectedCity('');
  };

  const handleApply = async (eventId) => {
    // Replace with the trainee's actual ID or details
    const traineeId = 'trainee1';

    await db.collection('applications').add({
      eventId,
      traineeId,
      status: 'pending',
    });

    alert('Applied for the event successfully');
  };

  return (
    <div>
      <h1>Trainee Page</h1>
      <div>
        <label htmlFor="activity">Activity:</label>
        <select
          name="activity"
          value={selectedActivity}
          onChange={(e) => setSelectedActivity(e.target.value)}
        >
          <option value="">Select an activity</option>
          {sports.map((sport) => (
            <option key={sport} value={sport}>
              {sport}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="city">City:</label>
        <select
          name="city"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          <option value="">Select a city</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleSearch}>Search</button>

      <ul>
        {filteredEvents.map((event) => (
          <li key={event.id}>
            {event.activity} - {event.city} - {event.date} - {event.time}
            <button onClick={() => handleApply(event.id)}>Apply</button>
          </li>
        ))}
      </ul>

      {filteredEvents.length === 0 && searchPerformed && (
        <p>
          Unfortunately, your search did not find any events. How about trying a
          new activity?
        </p>
      )}
    </div>
  );
};

export default TraineePage;