const amqp = require("amqplib");

const QUEUE_NAME = "colaVegeta777";  // Cambiar aquí

async function iniciarConsumer() {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Esto asegura que no le demos mas de 1 tarea a la vez
    channel.prefetch(1);

    console.log(" Microservicio de Notificaciones esperando mensajes...");

    // Escuchar la cola
    channel.consume(
      QUEUE_NAME,
      (msg) => {
        if (msg !== null) {
          // Parsear el mensaje
          const contenido = JSON.parse(msg.content.toString());

          console.log(
            `Recibido pedido ID: ${contenido.id} para enviar a ${contenido.email}`,
          );

          // SIMULAR TRABAJO PESADO (Envío de email tarda 5 segundos)
          setTimeout(() => {
            console.log(`Correo enviado a ${contenido.email}`);

            // Avisar a RabbitMQ que el trabajo terminó
            channel.ack(msg);
          }, 5000);
        }
      },
      {
        noAck: false, // Importante: Activamos la confirmación manual
      },
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

iniciarConsumer();