import {
  StyleSheet, Text, View,
  FlatList, Pressable, TextInput,
  ScrollView, useWindowDimensions,
} from "react-native";
import { useState, useEffect } from "react";
import { 
  addDoc, collection, onSnapshot,
  orderBy, query, serverTimestamp
} from "firebase/firestore";
import { db } from "./src/firebase";
// console.log("Firestore ready:", db);

type Room = {
  id: string;
  name: string;
  capacity: number;
  available: boolean;
  building: string;
  floor: number;
};

type Booking = {
  id: string;
  roomId: string;
  roomName: string;
  building: string;
  slot: string;
  purpose: string;
  bookedBy: string;
  createdAt?: unknown;
};

type RoomCardProps = {
  room: Room;
  onSelect: (room: Room) => void;
  isSelected: boolean;
};

// const rooms: Room[] = [
  
// ];

const slots = [
  "08:00-09:00",
  "09:00-10:00",
  "14:00-15:00",
];

function RoomCard({
  room,
  onSelect,
  isSelected
}: RoomCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.roomName}>
        {room.name}
      </Text>

      <Text>
        Building: {room.building}
      </Text>

      <Text>
        Floor: {room.floor}
      </Text>

      <Text>
        Capacity: {room.capacity}
      </Text>

      <Text>
        {room.available
          ? "Available"
          : "Unavailable"}
      </Text>

      <Pressable
        style={[
          styles.selectButton,
          !room.available && styles.selectButtonDisabled,
        ]}
        disabled={!room.available}
        onPress={() => onSelect(room)}
      >
        <Text style={styles.selectButtonText}>
          {isSelected
            ? "Selected"
            : "Select"}
        </Text>
      </Pressable>
    </View>
  );
}

export default function App() {
  const { height } = useWindowDimensions();

  const [rooms, setRooms] =
    useState<Room[]>([]);
  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [loadingRooms, setLoadingRooms] =
    useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    const roomsRef =
      collection(db, "rooms");

    const unsubscribe =
      onSnapshot(
        roomsRef,
        (snapshot) => {
          const roomItems =
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Room[];

          setRooms(roomItems);
          setLoadingRooms(false);
        }, (error) => {
          console.error(
            "Listen rooms failed:",
            error
          );

          setErrorMessage(
            "Cannot load rooms."
          );

          setLoadingRooms(false);
        }
      );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const bookingsQuery =
      query(
        collection(db, "bookings"),
        orderBy("createdAt", "desc")
      );

    const unsubscribe =
      onSnapshot(
        bookingsQuery,
        (snapshot) => {
          const bookingItems =
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Booking[];

          setBookings(
            bookingItems
          );
        },
        (error) => {
          console.error(
            "Listen bookings failed:",
            error
          );
        }
      );

    return unsubscribe;
  }, []);


  const [selectedBuilding, setSelectedBuilding] = 
    useState("ALL");
    
  const [selectedRoom, setSelectedRoom] =
    useState<Room | null>(null);
  
  const [selectedSlot, setSelectedSlot] = 
    useState<string | null>(null);

  const [purpose, setPurpose] =
    useState("");
  
  const [bookedBy, setBookedBy] =
    useState("");

  const [message, setMessage] =
    useState("");


  const visibleRooms =
    selectedBuilding === "ALL"
      ? rooms
      : rooms.filter(
          (room) =>
            room.building
            === selectedBuilding
        );

  const totalRooms = visibleRooms.length;
  const availableRooms = visibleRooms.filter((visibleRooms) => visibleRooms.available).length;
  const unavailableRooms = totalRooms - availableRooms;

  async function handleBookRoom() {
    if (!selectedRoom) {
      setMessage(
        "Please select a room."
      );
      return;
    }

    if (!selectedSlot) {
      setMessage(
        "Please select a time slot."
      );
      return;
    }

    if (!purpose.trim()) {
      setMessage(
        "Please enter purpose."
      );
      return;
    }

    if (!bookedBy.trim()) {
      setMessage(
        "Please enter your name."
      );
      return;
    }

    // setMessage(
    //   `Booking created 
    //   Room: ${selectedRoom.name}
    //   Building: ${selectedRoom.building}
    //   Purpose: ${purpose}`
    // );
    try {
      await addDoc(
        collection(db, "bookings"),
        {
          roomId: selectedRoom.id,
          roomName: selectedRoom.name,
          building: selectedRoom.building,
          slot: selectedSlot,
          purpose: purpose.trim(),
          bookedBy: bookedBy.trim(),
          createdAt: serverTimestamp(),
        }
      );

      setMessage(
        "Booking created."
      );

      setPurpose("");
      setBookedBy("");

    } catch (error) {
      console.error(
        "Create booking failed:",
        error
      );

      setMessage(
        "Cannot create booking."
      );
    }
  }


  return (

    <View style={styles.container}>
      <Text style={styles.title}>
        Room Booking
      </Text>

      {loadingRooms ? (
        <Text style={styles.label}>Loading rooms...</Text>
      ) : null}

      {errorMessage ? (
        <Text style={styles.label}>{errorMessage}</Text>
      ) : null}

      <Text style={styles.sectionTitle}>
        Total Rooms: {totalRooms} | Available: {availableRooms} | Unavailable: {unavailableRooms}
      </Text>

      <Text style={styles.sectionTitle}>
        Filter Rooms:
      </Text>

      <View style={styles.filterRow}>
        {["ALL", "Block A", "Block B"].map((building) => (
          <Pressable
            key={building}
            style={[
              styles.filterButton,
              selectedBuilding === building ? styles.selectedFilterButton : null,
            ]}
            onPress={() => setSelectedBuilding(building)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedBuilding === building ? styles.selectedFilterButtonText : null,
              ]}
            >
              {building}
            </Text>
          </Pressable>
        ))}
      </View>
        

      <View style={ {height: height * 0.25 }}>
      <FlatList
        data={visibleRooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RoomCard
            room={item}
            onSelect={setSelectedRoom}
            isSelected={
              selectedRoom?.id === item.id
            }
          />
        )}
      />
      </View>

      <ScrollView 
        style={styles.bottomScroll}
        showsVerticalScrollIndicator={false} // Ẩn thanh cuộn cho đẹp
      >
      <Text style={[styles.sectionTitle, styles.mt8]}>
        Recent Bookings | Total Bookings: {bookings.length}
      </Text>

      {bookings.slice(0, 1).map((booking) => (
        <View
          key={booking.id}
          style={styles.bookingCard}
        >
          <Text style={styles.roomName}>
            {booking.roomName}
          </Text>

          <Text>
            {booking.slot}
          </Text>

          <Text>
            {booking.purpose}
          </Text>

          <Text>
            Booked by: {booking.bookedBy}
          </Text>
        </View>
      ))}

      <Text style={[styles.selectedText]}>
        Selected:{" "}
        {selectedRoom
          ? selectedRoom.name
          : "None"}
      </Text>

      <Text style={styles.label}>
        Time Slot
      </Text>

      <View style={styles.slotRow}>
        {slots.map((slot) => (
          <Pressable
            key={slot}
            style={[
              styles.slotButton,
              selectedSlot === slot
                ? styles.selectedSlotButton
                : null,
            ]}
            onPress={() =>
              setSelectedSlot(slot)
            }
          >
            <Text>
              {slot}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>
        Purpose
      </Text>

      <TextInput
        style={styles.input}
        value={purpose}
        onChangeText={setPurpose}
        placeholder="Booking purpose"
      />

      <Text style={styles.md8}>
        Current purpose: {purpose || "(empty)"}
      </Text>

      <Text style={styles.label}>
        Booked By
      </Text>

      <TextInput
        style={styles.input}
        value={bookedBy}
        onChangeText={setBookedBy}
        placeholder="Your name"
      />

      <Pressable
        style={styles.bookButton}
        onPress={handleBookRoom}
      >
        <Text style={styles.bookButtonText}>
          Book Room
        </Text>
      </Pressable>

      {message ? (
        <Text style={styles.message}>
          {message}
        </Text>
      ) : null} 
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 48,
    backgroundColor: "#f5f5f5",
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 6,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 8,
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  bookingCard: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  roomName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },

  roomMeta: {
    marginBottom: 2,
  },

  selectButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#222222",
  },

  selectButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },

  bookingPanel: {
    paddingTop: 8,
    paddingBottom: 24,
  },

  selectedText: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "600",
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  mt8: { marginTop: 8 },
  md8: { marginBottom: 8 },

  slotRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginBottom: 16,
  },

  slotButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cccccc",
    backgroundColor: "#ffffff",
  },

  selectedSlotButton: {
    borderColor: "#222222",
    backgroundColor: "#eaeaea",
  },

  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },

  bookButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#222222",
  },

  bookButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },

  message: {
    marginVertical: 8,
    fontSize: 16,
    fontWeight: "600",
  },

  selectButtonDisabled: {
    backgroundColor: "#b0b0b0",
  },

  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },

  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#cccccc",
    backgroundColor: "#ffffff",
  },

  selectedFilterButton: {
    backgroundColor: "#222222",
    borderColor: "#222222",
  },

  filterButtonText: {
    color: "#333333",
    fontWeight: "600",
  },

  selectedFilterButtonText: {
    color: "#ffffff",
  },

  bottomScroll: {
    flex: 5,
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
});