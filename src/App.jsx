import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  MapPin, 
  Home,
  User,
  HelpCircle,
  Star,
  FileText,
  Info,
  LogOut,
  Bed,
  DollarSign,
  Users,
  Calendar
} from 'lucide-react';
import './App.css';

const API_BASE_URL = 'http://localhost:3000/api';

function App() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [userBookings, setUserBookings] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(null);
  const [priceHistory, setPriceHistory] = useState({});

  // Fetch rooms from backend
  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch user bookings when email is set
  useEffect(() => {
    if (userEmail) {
      fetchUserBookings();
      const interval = setInterval(fetchUserBookings, 3000); // Check bookings every 3 seconds
      return () => clearInterval(interval);
    }
  }, [userEmail]);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rooms`);
      const newRooms = response.data;
      
      // Track price changes for animations
      const newPriceHistory = { ...priceHistory };
      newRooms.forEach(room => {
        const oldPrice = rooms.find(r => r.id === room.id)?.current_price;
        if (oldPrice && oldPrice !== room.current_price) {
          newPriceHistory[room.id] = {
            oldPrice: parseFloat(oldPrice),
            newPrice: parseFloat(room.current_price),
            timestamp: Date.now()
          };
        }
      });
      
      setPriceHistory(newPriceHistory);
      setRooms(newRooms);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    if (!userEmail) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/bookings/${userEmail}`);
      setUserBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const bookRoom = async (roomId) => {
    if (!userEmail) {
      alert('Please enter your email first!');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/rooms/${roomId}/book`, {
        user_email: userEmail
      });
      
      alert('Room booked successfully! You have 30 minutes to confirm.');
      setShowBookingForm(null);
      fetchRooms();
      fetchUserBookings();
    } catch (error) {
      alert(error.response?.data?.error || 'Error booking room');
    }
  };

  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getPriceTrend = (roomId, currentPrice) => {
    const history = priceHistory[roomId];
    if (!history || Date.now() - history.timestamp > 10000) {
      // Random trend for demo if no recent history
      return Math.random() > 0.5 ? 'up' : 'down';
    }
    return history.newPrice > history.oldPrice ? 'up' : 'down';
  };

  const getPreviousPrice = (roomId, currentPrice) => {
    const history = priceHistory[roomId];
    if (history && Date.now() - history.timestamp < 10000) {
      return history.oldPrice.toFixed(2);
    }
    // Generate a fake previous price for demo
    const variation = (Math.random() - 0.5) * 20;
    return (parseFloat(currentPrice) - variation).toFixed(2);
  };

  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return 'EXPIRED';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getCurrentPeriod = () => {
    const hour = new Date().getHours();
    return (hour >= 6 && hour < 18) ? 'Morning Rates' : 'Night Rates';
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading rooms...</div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">🏨</div>
          <h2>DOT</h2>
          <p>Live Pricing</p>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item active">
            <Home size={20} />
            <span>Dashboard</span>
          </div>
          <div className="nav-item">
            <User size={20} />
            <span>My Bookings</span>
          </div>
          <div className="nav-item">
            <Bed size={20} />
            <span>All Rooms</span>
          </div>
          <div className="nav-item">
            <DollarSign size={20} />
            <span>Price History</span>
          </div>
          <div className="nav-item">
            <HelpCircle size={20} />
            <span>Help</span>
          </div>
          <div className="nav-item">
            <Star size={20} />
            <span>Rate App</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item">
            <LogOut size={20} />
            <span>Log out</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <h1>DOT - DEALS ON TIME</h1>
            <p className="tagline">The right room, right price, right now</p>
            <div className="period-indicator">
              <Clock size={16} />
              <span>{getCurrentPeriod()}</span>
            </div>
          </div>
          <div className="header-right">
            <input
              type="email"
              placeholder="Enter your email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="email-input"
            />
            <div className="live-indicator">
              <div className="pulse"></div>
              LIVE
            </div>
          </div>
        </header>

        {/* Stats Dashboard */}
        <div className="stats-dashboard">
          <div className="stat-card">
            <div className="stat-icon">
              <Bed size={24} />
            </div>
            <div className="stat-content">
              <h3>{rooms.length}</h3>
              <p>Available Rooms</p>
              <span className="stat-change positive">+2 vs yesterday</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <h3>${rooms.length > 0 ? Math.round(rooms.reduce((sum, room) => sum + parseFloat(room.current_price), 0) / rooms.length) : 0}</h3>
              <p>Avg Price/Night</p>
              <span className="stat-change negative">-5% vs yesterday</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3>{userBookings.length}</h3>
              <p>Your Bookings</p>
              <span className="stat-change positive">Active holds</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <h3>30min</h3>
              <p>Hold Duration</p>
              <span className="stat-change neutral">Standard</span>
            </div>
          </div>
        </div>

        {/* User Bookings Section */}
        {userBookings.length > 0 && (
          <div className="user-bookings">
            <h3>🔒 Your Active Bookings</h3>
            <div className="bookings-grid">
              {userBookings.map((booking) => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <h4>{booking.motel_name}</h4>
                    <div className="booking-timer">
                      {formatTimeRemaining(booking.seconds_remaining)}
                    </div>
                  </div>
                  <div className="booking-details">
                    <div className="booking-price">${booking.locked_price}</div>
                    <div className="booking-room">{booking.room_type}</div>
                    <div className="booking-period">{booking.pricing_period} rate</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Performer Banner */}
        <div className="top-performer">
          <div className="performer-content">
            <div className="performer-icon">🏆</div>
            <div>
              <h3>Best Deal of the Hour</h3>
              <p>{rooms.length > 0 ? rooms.sort((a, b) => parseFloat(a.current_price) - parseFloat(b.current_price))[0]?.motel_name : 'Loading...'}</p>
            </div>
          </div>
          <div className="performer-stats">
            <div className="trending-up">📈 High Demand</div>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="rooms-grid">
          {rooms.map((room) => {
            const trend = getPriceTrend(room.id, room.current_price);
            const previousPrice = getPreviousPrice(room.id, room.current_price);
            const currentPrice = parseFloat(room.current_price);
            const basePrice = parseFloat(room.pricing_period === 'morning' ? room.base_price_morning : room.base_price_night);

            return (
              <div key={room.id} className="room-card">
                <div className="room-header">
                  <div className="room-category">
                    {room.room_type.toUpperCase()}
                  </div>
                  <div className="room-info">
                    <h4>{room.motel_name}</h4>
                    <p>{room.motel_address.split(',')[0]}</p>
                  </div>
                </div>

                <div className="room-icon">
                  <Bed size={40} />
                </div>

                <div className="price-section">
                  <div className="price-history">
                    <span className={trend === 'up' ? 'price-up' : 'price-down'}>
                      ${currentPrice.toFixed(2)}
                    </span>
                    <span className={trend === 'down' ? 'price-up' : 'price-down'}>
                      ${previousPrice}
                    </span>
                  </div>

                  <div className="current-price">
                    <button 
                      className={`price-button ${trend === 'up' ? 'trending-up' : 'trending-down'}`}
                      onClick={() => setShowBookingForm(room.id)}
                    >
                      <span className="price">${currentPrice.toFixed(0)}</span>
                      {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </button>
                  </div>

                  <div className="room-details">
                    <div className="room-time">
                      <Clock size={14} />
                      {formatTime(room.period_start)} - {formatTime(room.period_end)}
                    </div>
                    <div className="room-availability">
                      <MapPin size={14} />
                      {room.rooms_available} rooms left
                    </div>
                  </div>

                  <div className="price-comparison">
                    <span className="base-price">Base: ${basePrice.toFixed(0)}</span>
                    <span className={currentPrice > basePrice ? 'price-premium' : 'price-discount'}>
                      {currentPrice > basePrice ? '+' : ''}{((currentPrice - basePrice) / basePrice * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {showBookingForm === room.id && (
                  <div className="booking-modal">
                    <div className="modal-content">
                      <h3>Book this room?</h3>
                      <div className="modal-details">
                        <p><strong>{room.motel_name}</strong></p>
                        <p>{room.room_type}</p>
                        <p className="modal-price">${currentPrice.toFixed(2)}/night</p>
                        <p>Valid: {formatTime(room.period_start)} - {formatTime(room.period_end)}</p>
                        <p className="modal-note">30-minute hold • Free cancellation</p>
                      </div>
                      <div className="modal-buttons">
                        <button 
                          onClick={() => bookRoom(room.id)}
                          className="book-button"
                        >
                          Book Now (30min hold)
                        </button>
                        <button 
                          onClick={() => setShowBookingForm(null)}
                          className="cancel-button"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;