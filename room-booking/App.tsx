import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  TextInput,
} from "react-native";
import { useState } from "react";

type Room = {
  id: string;
  name: string;
  capacity: number;
  available: boolean;
  building: string;
};

type RoomCardProps = {
  room: Room;
  onSelect: (room: Room) => void;
  isSelected: boolean;
};

const rooms: Room[] = [
  {
    id: "a201",
    name: "A201",
    capacity: 30,
    available: true,
    building: "Block A",
  },
  {
    id: "a202",
    name: "A202",
    capacity: 50,
    available: true,
    building: "Block A",
  },
  {
    id: "b101",
    name: "B101",
    capacity: 40,
    available: true,
    building: "Block B",
  },
  {
    id: "c303",
    name: "C303",
    capacity: 20,
    available: true,
    building: "Block C",
  },
  {
    id: "b202",
    name: "B202",
    capacity: 60,
    available: false,
    building: "Block B",
  },
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
  const [selectedRoom, setSelectedRoom] =
    useState<Room | null>(null);
  const [purpose, setPurpose] =
    useState("");
  const [message, setMessage] =
    useState("");

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((room) => room.available).length;
  const unavailableRooms = totalRooms - availableRooms;

  function handleBookRoom() {
    if (!selectedRoom) {
      setMessage(
        "Please select a room."
      );
      return;
    }

    if (!purpose.trim()) {
      setMessage(
        "Please enter purpose."
      );
      return;
    }

    setMessage(
      `Booking created 
      Room: ${selectedRoom.name}
      Building: ${selectedRoom.building}
      Purpose: ${purpose}`
    );

    setPurpose("");
  }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Room Booking
      </Text>

      <Text style={styles.sectionTitle}>
        Total Rooms: {totalRooms}
      </Text>
      <Text style={styles.sectionTitle}>
        Available: {availableRooms}
      </Text>
      <Text style={styles.sectionTitle}>
        Unavailable: {unavailableRooms}
      </Text>

      <FlatList
        data={rooms}
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
      <Text style={styles.selectedText}>
        Selected:{" "}
        {selectedRoom
          ? selectedRoom.name
          : "None"}
      </Text>

      <Text style={styles.label}>
        Purpose
      </Text>

      <TextInput
        style={styles.input}
        value={purpose}
        onChangeText={setPurpose}
        placeholder="Booking purpose"
      />

      <Text>
        Current purpose: {purpose || "(empty)"}
      </Text>
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
    fontSize: 18,
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

  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
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
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
  },

  selectButtonDisabled: {
    backgroundColor: "#b0b0b0",
  },
});