import React from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";

//modal to show when two users match
const MatchModal = ({ visible, match, onClose, seeProfile }) => {
  const { name } = match;

  return (
    <Modal
      transparent={true}
      onRequestClose={onClose}
      visible={visible}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>You've matched with {name}!</Text>
          <Text style={styles.modalText}>You both like each other!</Text>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>Keep scrolling</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={seeProfile}>
            <Text style={styles.modalButtonText}>Start talking!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#62ab48",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default MatchModal;
