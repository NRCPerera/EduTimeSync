import EventCard from './EventCard';

const EventList = ({ events, loading, setSuccess, setError, setLoading, fetchEvents, navigate }) => {
  return (
    <div>
      {loading ? (
        <div className="flex justify-center my-12">
          <svg
            className="animate-spin h-10 w-10 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.length === 0 ? (
            <div className="col-span-2 bg-white p-8 rounded-xl shadow-md text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-xl font-medium mt-4 text-gray-600">No events available</h3>
              <p className="text-gray-500 mt-2">Create your first event to get started</p>
            </div>
          ) : (
            events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                setSuccess={setSuccess}
                setError={setError}
                setLoading={setLoading}
                fetchEvents={fetchEvents}
                navigate={navigate}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default EventList;