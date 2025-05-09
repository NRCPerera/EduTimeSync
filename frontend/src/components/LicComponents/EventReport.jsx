import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#E4E4E4',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  event: {
    marginBottom: 10,
  },
});

const EventReport = ({ events }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>Event Report</Text>
        {events.map((event, index) => (
          <View key={index} style={styles.event}>
            <Text>{event.title}</Text>
            <Text>Time: {event.period}</Text>
            <Text>Assigned Examiner: {event.assignedExaminer}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default EventReport;