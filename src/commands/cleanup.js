const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cleanup')
        .setDescription('🗑️ Supprime TOUS les canaux et rôles du serveur (ADMIN SEULEMENT - ATTENTION!)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const guild = interaction.guild;

            await interaction.editReply('⚠️ **NETTOYAGE EN COURS...**\n\n*Suppression de tous les canaux et rôles (sauf @everyone)...*');

            // Supprimer tous les canaux
            const channels = guild.channels.cache.filter(ch => ch.deletable);
            let deletedChannels = 0;

            for (const channel of channels.values()) {
                try {
                    await channel.delete('Cleanup avant setup');
                    deletedChannels++;
                } catch (error) {
                    console.log(`Impossible de supprimer le canal: ${channel.name}`);
                }
            }

            // Supprimer tous les rôles (sauf @everyone et rôles système)
            const roles = guild.roles.cache.filter(role =>
                role.editable &&
                !role.managed &&
                role.id !== guild.id
            );
            let deletedRoles = 0;

            for (const role of roles.values()) {
                try {
                    await role.delete('Cleanup avant setup');
                    deletedRoles++;
                } catch (error) {
                    console.log(`Impossible de supprimer le rôle: ${role.name}`);
                }
            }

            await interaction.editReply({
                content: `✅ **Nettoyage terminé!**\n\n` +
                    `🗑️ ${deletedChannels} canaux supprimés\n` +
                    `🗑️ ${deletedRoles} rôles supprimés\n\n` +
                    `**Tu peux maintenant faire \`/setup\` pour créer la structure Farmer League!**`
            });

            console.log(`✅ Cleanup terminé: ${deletedChannels} canaux, ${deletedRoles} rôles supprimés`);

        } catch (error) {
            console.error('❌ Erreur lors du cleanup:', error);
            await interaction.editReply({
                content: '❌ **Erreur lors du nettoyage.**\n\nVérifie que le bot a les permissions Administrator.'
            });
        }
    }
};
