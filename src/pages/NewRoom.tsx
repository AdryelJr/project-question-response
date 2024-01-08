import { Link, useNavigate } from 'react-router-dom';
import { FormEvent, useState } from 'react';

import illustrationImg from '../assets/images/illustration.svg';
import logoImg from '../assets/images/logo.svg'

import { Button } from '../componentes/Button';

import '../styles/auth.scss'
import { useAuth } from '../hooks/useAuth';
import { database } from '../services/firebase';
import { ref, push, set } from 'firebase/database';

export function NewRoom() {

    const { user } = useAuth();

    const [newRoom, setNewRoom] = useState('');

    const navigate = useNavigate();

    async function handleCrateRoom(event: FormEvent) {
        event.preventDefault();

        if (newRoom.trim() === '') {
            return;
        }

        const roomRef = ref(database, 'rooms');

        const newRoomRef = push(roomRef);

        await set(newRoomRef, {
            title: newRoom,
            authorId: user?.id,
        })
        
        navigate(`/rooms/${newRoomRef.key}`);
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
                    <h2>Criar uma nova sala</h2>
                    <form onSubmit={handleCrateRoom}>
                        <input
                            type="text"
                            placeholder='Nome da sala'
                            onChange={event => setNewRoom(event.target.value)}
                            value={newRoom}
                        />
                        <Button
                            type='submit'>Criar sala
                        </Button>
                    </form>
                    <p>
                        Quer entrar em uma sala existente? <Link to="/">Clique aqui</Link>
                    </p>
                </div>
            </main>
        </div>
    )
}