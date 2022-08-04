const net = require("net");
const PORT = 1337;
let clients = [];
let clientsNames = [];
let chatHistory = [];
var name;

function isValid(username) {
  username = username.toString().substring(0, username.length - 1);
  return /^[a-zA-Z0-9]+$/.test(username);
}

function nameTransform(name) {
  name = name.toString().toLowerCase().replace("\n", " ");
  return name[0].toUpperCase() + name.substring(1);
}

const server = net.createServer((socket) => {
  const clientInfo = `${socket.remoteAddress} : ${socket.remotePort}`;

  socket.write("Enter your nickname: ");

  socket.on("data", (message) => {
    // перевіряємо ім'я на валідність
    if (!clients.includes(socket)) {
      if (!isValid(message)) {
        socket.write(
          "\x1b[31;43mTry another name. The name can only contain alphabetic characters and numbers\x1b[0m\n"
        );
        socket.write("Enter your nickname: ");
        return;
      }
      name = nameTransform(message);
      // добавляємо в чат
      clients.push(socket);
      clientsNames.push(name);

      socket.write(`Your name is \x1b[4m ${name}\x1b[0m\n`);
      // Пишему усім, що новий клієнтам під'єднався
      clients.forEach((client) => {
        if (client !== socket) {
          client.write("\r\n" + "\x1b[15C " + `\u001b[7m${name} joined to chat\u001b[0m` + "\n\n\x1b[30C");
        }
      });
      //  WELCOME
      socket.write(
        "\x1b[15C " +
          "\u001b[40;1m W \u001b[41;1m E \u001b[42;1m L \u001b[43;1m L \u001b[40;1m C \u001b[41;1m O \u001b[42;1m M \u001b[43;1m E \u001b[0m" +
          "\n\n"
      );
      // виводимо всю історію чату для нового клієнта
      for (let i = 0; i < chatHistory.length; i++) {
        socket.write(`\x1b[36;1m${chatHistory[i]["user"][0]}> \x1b[0m${chatHistory[i]["user"][1]}\n`);
      }
      // логуємо клієнта та переводимо каретку в праве положення
      console.log(`+ ${clientInfo} ( ${name}) - CONNECTED`);
      socket.write("\x1b[35C");
    } else {
      // переводимо каретку в праве положення та зберігаємо повідомлення
      socket.write("\n\r\x1b[35C");
      name = clientsNames[clients.indexOf(socket)];
      chatHistory.push({ user: [name, message] });
      // виводимо усім клієнтам відправлене повідомлення
      clients.forEach((client) => {
        if (client !== socket) {
          client.write(`\r\x1b[36;1m${name} > \x1b[0m${message}\n`);
          client.write("\r\x1b[35C");
        }
      });
    }
    // логуємо повідомлення
    process.stdout.write(`> ${clientInfo} ( ${name}): ${message}`);
  });

  socket.on("close", () => {
    let index = clients.indexOf(socket);
    name = clientsNames[index];
    // видаляємо клієнта
    if (index !== -1) {
      clients.splice(index, 1);
      clientsNames.splice(index, 1);
    }
    // пишемо усім користувачам про від'єднання клієнта
    clients.forEach((client) => {
      client.write("\r\x1b[15C " + `\u001b[31m${name}\u001b[0m \u001b[41;1mleft the chat\u001b[0m` + "\n\x1b[30C ");
    });
    // логуємо вихід
    console.log(`- ${clientInfo} ( ${name}) - CLOSED`);
  });
});

server.listen(PORT, "127.0.0.1", (err) => {
  if (err) console.log(err);
  console.log(`Server started at localhost: ${PORT}`);
});
