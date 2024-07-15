document.addEventListener("DOMContentLoaded", function () {
  const socket = io(); // connection request is sent to back-end

  let lastUpdatedTime = 0;
  const updateInterval = 3500; // 3.5 seconds
  const statusMsg = document.querySelector(".status_msg");
  const uniq_key = document.querySelector(".uniquekey");

  statusMsg.textContent = "locating...";

  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (pos) => {
        const curr_time = Date.now();
        if (curr_time - lastUpdatedTime >= updateInterval) {
          lastUpdatedTime = curr_time;
          const { latitude, longitude } = pos.coords;
          socket.emit("send-location", {
            name: username, // helps to display the username
            latitude: latitude.toFixed(5),
            longitude: longitude.toFixed(5),
          });
          statusMsg.textContent = "found, locating others....";
        }
      },
      (error) => {
        console.error(`something went wrong!!\n${error}`);
        statusMsg.textContent = "can't locate others...";
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0, // no caching
        timeout: 5000, // refresh after 5sec interval
      }
    );
  }

  const map = L.map("map").setView([0, 0], 17);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Where You At?",
  }).addTo(map);

  const markers = {};

  socket.on("receive-location", (data) => {
    const { id, name, latitude, longitude } = data;

    if (id === socket.id) {
      map.setView([latitude, longitude]);
    }
    if (markers[id]) {
      markers[id].setLatLng([latitude, longitude]);
      markers[id].getPopup().setContent(name);
    } else {
      markers[id] = L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(name)
        .openPopup();
    }
    statusMsg.textContent = `${name} online!!`;
  });

  socket.on("user-disconnect", (data) => {
    const {id, username} = data;
    if (markers[id]) {
      map.removeLayer(markers[id]);
      delete markers[id];
    }
    statusMsg.textContent = `${username} offline!!`;
  });

  socket.on('unique-key',(key) => {
    uniq_key.textContent = `your unique key is ${key}`;
  });
});
