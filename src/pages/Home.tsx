import { useNavigate } from 'react-router-dom';
import { FormEvent, useState } from 'react';

import { database } from '../services/firebase';
import { child, get, ref } from 'firebase/database';
import illustrationImg from '../assets/images/illustration.svg';
import logoImg from '../assets/images/logo.svg';
import googleIconImg from '../assets/images/google-icon.svg';

import { Button } from '../componentes/Button';

import { useAuth } from '../hooks/useAuth';
import '../styles/auth.scss'



export function Home() {

    const navigate = useNavigate();
    const { user, signInWithGoogle } = useAuth();
    const [roomCode, setRoomCode] = useState('');

    async function handleCreateRomm() {
        if(!user){
            await signInWithGoogle();
        }
        navigate('./rooms/new');
    }

    async function handleJoinRoom(event: FormEvent){
        event.preventDefault();

        if(roomCode.trim() === ''){
            return;
        }

        const roomRef = ref(database, `rooms/${roomCode}`);
        const snapshot = await get(child(roomRef, '/'));

        if(!snapshot.exists()){
            alert("Sala não encontrada.");
            console.log(`/rooms/${roomCode}`)
            return;
        }

        if(snapshot.val().endedAt){
            alert("Essa sala foi finalizada!")
            return;
        }

        navigate(`/rooms/${roomCode}`);
    }
    

    return (
        <div id='page-auth'>
            <aside>
                <img src={illustrationImg} alt="img perguntas e respostas" />
                <strong>Crie salas de Q&amp;A ao-vivo</strong>
                <p>Tire suas dúvidas em tempo real</p>
            </aside>

            <main>
                <div className='main-content'>
                    <img src={logoImg} alt="logo" />
                    <button className='creat-room' onClick={handleCreateRomm}>
                        <img src={googleIconImg} alt="google imagem" />
                        Crie sua sala com o Google
                    </button>

                    <div className='separador'>Ou entre em uma sala</div>

                    <form onSubmit={handleJoinRoom}>
                        <input
                            type="text"
                            placeholder='Digite o código da sala'
                            onChange={event => setRoomCode(event.target.value)}
                            value={roomCode}
                        />
                        <Button
                            type='submit'>Entrar na sala
                        </Button>
                    </form>
                </div>
            </main>
        </div>
    )
}