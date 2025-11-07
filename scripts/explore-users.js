// fetch-clickup-users.js

// eslint-disable-next-line @typescript-eslint/no-require-imports
const axios = require('axios');

// Reemplaza esto con tu token personal de ClickUp
const CLICKUP_TOKEN = 'pk_114240449_Z7E2UHHHWSF14M6T98OZTQUJ9WC83U47';

// Función para obtener el ID del equipo
async function getTeamId() {
  try {
    const res = await axios.get('https://api.clickup.com/api/v2/team', {
      headers: {
        Authorization: CLICKUP_TOKEN,
      },
    });

    const teams = res.data.teams;
    if (!teams || !teams.length) throw new Error('No se encontraron equipos');

    console.log(`✅ Workspace encontrado: ${teams[0].name} (ID: ${teams[0].id})`);
    return teams[0].id;
  } catch (err) {
    console.error('❌ Error obteniendo equipo:', err.message);
    process.exit(1);
  }
}

async function listTeamUsers(teamId) {
  try {
    const res = await axios.get(`https://api.clickup.com/api/v2/team/${teamId}`, {
      headers: {
        Authorization: CLICKUP_TOKEN,
      },
    });

    console.log('📦 Respuesta completa de ClickUp al obtener usuarios:');
    console.dir(res.data, { depth: null });

    const users = res.data.members;
    if (!users || !users.length) throw new Error('No se encontraron miembros en el equipo');

    console.log(`👥 Usuarios encontrados (${users.length}):`);
    users.forEach((member) => {
      const user = member.user;
      console.log(`- ${user.username} | Email: ${user.email} | ClickUp ID: ${user.id}`);
    });

    return users.map((member) => member.user);
  } catch (err) {
    console.error('❌ Error listando usuarios:', err.message);
    process.exit(1);
  }
}

(async () => {
  const teamId = await getTeamId();
  await listTeamUsers(teamId);
})();