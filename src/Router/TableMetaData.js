const socketController = require('../Controller/TableField');

module.exports = (io, socket) => {
  // Define Socket.IO events and handling here
  socket.on('data-update', () => {
    socketController.fetchDataFromDB((err, data) => {
      if (err) {
        console.error('Error fetching data from DB:', err);
      } else {
        // Emit data to the connected socket
        console.error('data:', data);
        socket.emit('data-update', data);
      }
    });
  });
};


// module.exports = (io, socket) => {
//   // Define Socket.IO events and handling here
//   var Data = 'not yet defined';
//   socketController.fetchDataFromDB((err, data) => {
//     if (err) {
//       console.error('Error fetching data from DB:', err);
//     } else {
//       // Emit data to the connected socket
//       Data = data;
//       io.emit('data-update', Data);
//       // console.log('data-update', Data);
//     }
//   });
//   // io.on('data-update', function (client) {
//   //   console.log('data-update', Data);
//   //   client.emit('data-update', Data);
//   // });
// };