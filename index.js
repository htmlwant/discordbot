const http = require('http');
http.createServer((req, res) => {
  res.write("I'm alive");
  res.end();
}).listen(8080);

const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildVoiceStates 
    ]
});

// ================= [ 본인 서버 정보 입력 ] =================
const TOKEN = process.env.DISCORD_TOKEN; 
const CATEGORY_ID = '1402345731427401821'; 
const CREATE_CHANNEL_ID = '1475086771455787181'; 

// [랜덤으로 띄울 이모지 리스트] - 원하는 이모지를 자유롭게 추가하세요!
const EMOJI_LIST = ['✨', '🔥', '💎', '🍀', '🍭', '⭐', '🎈', '🎁', '🔮', '🎮', '🎤', '🎧'];
// =========================================================

client.once('ready', () => {
    console.log(`
    ======================================
    ✅ 시스템 정상 작동 중: ${client.user.tag}
    ✅ 방식: 입장 시 자동 생성 (랜덤 이모지)
    ======================================
    `);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    const member = newState.member;
    if (!member || member.user.bot) return;

    // 1. 방 생성 로직
    if (newState.channelId === CREATE_CHANNEL_ID) {
        try {
            const nickName = member.displayName;

            // [랜덤 이모지 선택 로직]
            const randomEmoji = EMOJI_LIST[Math.floor(Math.random() * EMOJI_LIST.length)];
            
            // 선택된 랜덤 이모지를 방 제목 앞에 붙임
            const decoratedName = `${randomEmoji} ${nickName} 방`;

            const newChannel = await newState.guild.channels.create({
                name: decoratedName,
                type: ChannelType.GuildVoice,
                parent: CATEGORY_ID,
                bitrate: 96000,
                userLimit: 0,
                permissionOverwrites: [
                    {
                        id: newState.guild.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
                    },
                    {
                        id: member.id,
                        allow: [
                            PermissionFlagsBits.ManageChannels,
                            PermissionFlagsBits.MoveMembers,
                            PermissionFlagsBits.MuteMembers,
                            PermissionFlagsBits.DeafenMembers,
                            PermissionFlagsBits.PrioritySpeaker,
                            PermissionFlagsBits.Stream
                        ],
                    }
                ],
            });

            await newState.setChannel(newChannel);
            console.log(`[${randomEmoji} 생성] ${nickName} 님의 방이 생성되었습니다.`);

        } catch (error) {
            console.error('❌ 방 생성 중 에러 발생:', error);
        }
    }

    // 2. 방 삭제 로직
    if (oldState.channelId) {
        const oldChannel = oldState.channel;

        if (
            oldChannel &&
            oldChannel.parentId === CATEGORY_ID &&
            oldChannel.id !== CREATE_CHANNEL_ID &&
            oldChannel.members.size === 0
        ) {
            try {
                await oldChannel.delete();
                console.log(`[🗑️ 삭제] 빈 방 정리 완료: ${oldChannel.name}`);
            } catch (error) {}
        }
    }
});


client.login(TOKEN);
