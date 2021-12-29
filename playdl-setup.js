const play = require('play-dl');

const clientID = async () => {
    play.getFreeClientID().then((clientID) => {
        console.log(clientID);
        play.setToken({
          soundcloud : {
              client_id : clientID
          }
        });
    });
}

clientID();

play.authorization();