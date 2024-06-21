// Variável global para armazenar a instância do FFmpeg
let ffmpegInstance = null;

// Inicializar ffmpeg.js ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Verifique se FFmpeg está definido
        if (typeof FFmpeg === 'undefined') {
            throw new Error('FFmpeg não está disponível.');
        }

        const { createFFmpeg } = FFmpeg;
        ffmpegInstance = createFFmpeg({ log: true });

        // Carregar a instância do ffmpeg
        await ffmpegInstance.load();
        console.log('ffmpeg.js carregado com sucesso.');
    } catch (error) {
        console.error('Erro ao carregar ffmpeg.js:', error);
    }
});

// Função para criar o vídeo personalizado
async function createCustomVideo() {
    if (!ffmpegInstance || !ffmpegInstance.isLoaded()) {
        console.error('ffmpeg.js não está carregado corretamente.');
        return;
    }

    const images = document.getElementById('imageUpload').files;
    if (images.length === 0) {
        console.error('Nenhuma imagem selecionada.');
        return;
    }

    const videoContainer = document.getElementById('videoContainer');
    videoContainer.innerHTML = '';

    try {
        for (let i = 0; i < images.length; i++) {
            const imageData = await fetchImageFile(images[i]);
            ffmpegInstance.FS('writeFile', `image_${i}.png`, imageData);
        }

        await ffmpegInstance.run('-framerate', '1', '-i', 'image_%d.png', 'output.mp4');

        const data = ffmpegInstance.FS('readFile', 'output.mp4');
        const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
        const videoElement = document.createElement('video');
        videoElement.src = url;
        videoElement.controls = true;
        videoContainer.appendChild(videoElement);

        console.log('Vídeo criado com sucesso.');
    } catch (error) {
        console.error('Erro ao criar vídeo personalizado:', error);
    }
}

// Função auxiliar para converter Blob em Uint8Array
async function fetchImageFile(file) {
    const response = await fetch(URL.createObjectURL(file));
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
}

// Event listener para o botão de criar vídeo
const createVideoBtn = document.getElementById('createVideoBtn');
createVideoBtn.addEventListener('click', createCustomVideo);
