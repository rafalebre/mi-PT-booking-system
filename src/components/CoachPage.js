import React, { useState, useEffect } from 'react';
import db from '../firebase';

const CoachPage = () => {
  const [events, setEvents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [eventData, setEventData] = useState({
    activity: '',
    date: '',
    hour: '',
    minutes: '',
    city: '',
  });

  const activities = [
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const eventWithTime = {
      ...eventData,
      time: `${eventData.hour}:${eventData.minutes}`,
    };

    db.collection('events')
      .add(eventWithTime)
      .then((docRef) => {
        console.log('Event saved with ID:', docRef.id);
        setEvents([...events, { ...eventWithTime, id: docRef.id }]);
        setShowModal(false);
      })
      .catch((error) => {
        console.error('Error adding event:', error);
      });
  };

  useEffect(() => {
    const unsubscribe = db
      .collection("events")
      .onSnapshot((snapshot) => {
        const fetchedEvents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(fetchedEvents);
      });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = db
      .collection("applications")
      .onSnapshot((snapshot) => {
        const fetchedApplications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setApplications(fetchedApplications);
      });

    return () => {
      unsubscribe();
    };
  }, []);

  const updateApplicationStatus = async (applicationId, status) => {
    await db.collection('applications').doc(applicationId).update({ status });
  };

  return (
    <div>
      <h1>Coach Page</h1>
      <button onClick={() => setShowModal(true)}>Create Event</button>

      {showModal && (
        <div className="modal">
          <form onSubmit={handleSubmit}>
            <label htmlFor="activity">Activity:</label>
            <select name="activity" value={eventData.activity} onChange={handleChange} required>
              <option value="">Select an activity</option>
              {activities.map((activity) => (
                <option key={activity} value={activity}>
                  {activity}
                </option>
              ))}
            </select>

            <label htmlFor="date">Date:</label>
            <input type="date" name="date" value={eventData.date} onChange={handleChange} required />

            <label htmlFor="time">Time:</label>
            <input type="time" name="time" step="1800" value={eventData.time} onChange={handleChange} required />

            <label htmlFor="city">City:</label>
            <select name="city" value={eventData.city} onChange={handleChange} required>
              <option value="">Select a city</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <button type="submit">Submit</button>
            <button type="button" onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}
       <ul>
        {events.map((event) => (
          <li key={event.id}>
            {event.activity} - {event.date} - {event.time} - {event.city}{' '}
            <button
              onClick={() => {
                // Remove the event from the Firestore database
                db.collection('events')
                  .doc(event.id)
                  .delete()
                  .then(() => {
                    console.log('Event successfully deleted!');
                    // Remove the event from the events array
                    const updatedEvents = events.filter((e) => e.id !== event.id);
                    setEvents(updatedEvents);
                  })
                  .catch((error) => {
                    console.error('Error removing event:', error);
                  });
              }}
            >
              Cancel
            </button>
            <ul>
              {applications
                .filter((app) => app.eventId === event.id)
                .map((app) => (
                  <li key={app.id}>
                    {app.traineeName} applied for {event.activity}
                    <button onClick={() => updateApplicationStatus(app.id, 'accepted')}>Accept</button>
                    <button onClick={() => updateApplicationStatus(app.id, 'rejected')}>Reject</button>
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CoachPage;