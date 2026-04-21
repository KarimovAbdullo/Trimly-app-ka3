import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  header: {
    backgroundColor: "#4F46E5",
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 24,
    paddingTop: 60,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  headerSubtitle: {
    color: "#E0E7FF",
    marginTop: 4,
  },

  content: {
    padding: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#0F172A",
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  item: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  itemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },

  itemSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
  },

  itemDanger: {
    color: "#DC2626",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  modalText: {
    marginTop: 10,
    color: "#334155",
  },

  modalActions: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },

  btn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  btnOutline: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },

  btnDanger: {
    backgroundColor: "#DC2626",
  },

  btnEmail: {
    backgroundColor: "#4F46E5",
  },

  btnWhatsApp: {
    backgroundColor: "#25D366",
  },

  btnText: {
    fontWeight: "600",
  },

  btnTextWhite: {
    color: "#fff",
  },
});
