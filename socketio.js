const moment = require('moment');
const blessed = require('blessed');

const screen = blessed.screen({
  smartCSR: true,
});

screen.key(['escape', 'q', 'C-c'], (ch, key) => process.exit(0));

const titleBox = blessed.box({
  top: 0,
  left: 0,
  width: '100%',
  height: 1,
});

const buyBox = blessed.box({
  top: 1,
  left: 0,
  width: '50%',
  height: '100%-1',
  content: '',
  border: {
    type: 'line',
  },
});
const sellBox = blessed.box({
  top: 1,
  right: 0,
  width: '50%',
  height: '100%-1',
  content: '',
  border: {
    type: 'line',
  },
});

const buyTable = blessed.listtable({
  parent: buyBox,
  width: '90%',
  height: '90%'
});
const sellTable = blessed.listtable({
  parent: sellBox,
  width: '90%',
  height: '90%'
});

const updateTitle = (symbol, lastT) => {
  titleBox.setContent(symbol + " last update: " + moment(lastT || new Date()).format("MM/DD hh:mm:ss"));
  screen.render();
};

const updatePrice = msg => {
  const table = msg.messageType == 'pricelevelbuy' ? buyTable : sellTable;
  const rows = msg.data.map(({price, size, timestamp}) => {
    const dt = new Date(timestamp);
    return ["$" + parseFloat(price).toFixed(2), "" + size, moment(dt).format("hh:mm:ss")];
  });
  if (msg.messageType == 'pricelevelsell') {
    rows.reverse();
  }
  table.setData(rows);
  screen.render();
  updateTitle(msg.symbol);
};

screen.append(titleBox);
screen.append(buyBox);
screen.append(sellBox);


const url = 'https://ws-api.iextrading.com/1.0/deep'
const socket = require('socket.io-client')(url)

const argSymbol = (process.argv[2] || 'snap').toUpperCase();
socket.on('message', message => updatePrice(JSON.parse(message)));
socket.on('connect', () => {
  socket.emit('subscribe', JSON.stringify({
    symbols: [argSymbol],
    channels: ['book'],
  }))
})

updateTitle(argSymbol);
screen.render();
