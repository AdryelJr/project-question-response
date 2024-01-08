import { useNavigate, useParams } from 'react-router-dom';

import logoImg from '../assets/images/logo.svg';
import deleteImg from '../assets/images/delete.svg';
import checkImg from '../assets/images/check.svg';
import answerImg from '../assets/images/answer.svg';

import { Button } from '../componentes/Button';
import { RoomCode } from '../componentes/RoomCode';

import { useEffect, useState } from 'react';
import { database } from '../services/firebase';
import { onValue, ref, remove, update } from 'firebase/database';

import '../styles/room.scss';
import { Question } from '../componentes/Question';

type FirebaseQuestions = Record<string, {
    author: {
        name: string;
        avatar: string;
    }
    content: string;
    isAnswered: boolean;
    isHighLighted: boolean;
}>

type QuestionType = {
    id: string;
    author: {
        name: string;
        avatar: string;
    }
    content: string;
    isAnswered: boolean;
    isHighLighted: boolean;
}

type RoomParams = {
    id: string;
}


export function AdminRoom() {
    const navigate = useNavigate();
    const params = useParams<RoomParams>();
    const [questions, setQuestions] = useState<QuestionType[]>([]);
    const [title, setTitle] = useState('');

    const roomId = params.id;

    useEffect(() => {
        const roomRef = ref(database, `rooms/${roomId}`);

        const unsubscribe = onValue(roomRef, (snapshot) => {
            if (snapshot.exists()) {
                const databaseRoom = snapshot.val();
                const firebaseQuestions: FirebaseQuestions = databaseRoom.questions ?? {};

                const parsedQuestions = Object.entries(firebaseQuestions).map(([key, value]) => {
                    return {
                        id: key,
                        content: value.content,
                        author: value.author,
                        isHighLighted: value.isHighLighted,
                        isAnswered: value.isAnswered
                    };
                });

                setTitle(databaseRoom.title);
                setQuestions(parsedQuestions);

            }
        }, (error) => {
            console.error("Error getting document:", error);
        });

        return () => unsubscribe();
    }, [roomId]);

    async function handleEndRoom() {
        const roomRef = ref(database, `rooms/${roomId}`);
        const updates = {
            endedAt: new Date(),
        }
        await update((roomRef), updates);
        navigate('/');
    }

    async function handleDeleteQuention(questionId: string) {
        if (window.confirm('Tem certeza que você deseja excluir esta pergunta?')) {
            const questionRef = ref(database, `rooms/${roomId}/questions/${questionId}`);
            await remove(questionRef);
        }
    }

    async function handleCheckQuestionAsAnswer(questionId: string) {
        const questionRef = ref(database, `rooms/${roomId}/questions/${questionId}`);
        const updates = {
            isAnswered: true,
        }
        await update((questionRef), updates);
    }

    async function handleHighlightQuestion(questionId: string) {
        const questionRef = ref(database, `rooms/${roomId}/questions/${questionId}`);
        const updates = {
            isHighLighted: true,
        }
        await update((questionRef), updates);
    }



    return (
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={logoImg} alt="logo" />
                    <div>
                        <RoomCode code={roomId ?? ''} />
                        <Button isOutlined onClick={handleEndRoom}> Encerrar sala</Button>
                    </div>
                </div>
            </header>

            <main>
                <div className='room-title'>
                    <h1>Sala {title || 'Carregando...'}</h1>
                    <span>{questions.length} Pergunta(s)</span>
                </div>

                <div className='question-list'>
                    {questions.map(questions => {
                        return (
                            <Question
                                key={questions.id}
                                content={questions.content}
                                author={questions.author}
                                isAnswered={questions.isAnswered}
                                isHighLighted={questions.isHighLighted}
                            >
                                {!questions.isAnswered && (
                                    <>
                                        <button
                                            type='button'
                                            onClick={() => handleCheckQuestionAsAnswer(questions.id)}
                                        >
                                            <img src={checkImg} alt="Marcar pergunta como respondida" />
                                        </button>

                                        <button
                                            type='button'
                                            onClick={() => handleHighlightQuestion(questions.id)}
                                        >
                                            <img src={answerImg} alt="Dar destaque à pergunta" />
                                        </button>
                                    </>
                                )}

                                <button
                                    type='button'
                                    onClick={() => handleDeleteQuention(questions.id)}
                                >
                                    <img src={deleteImg} alt="Remove pergunta" />
                                </button>
                            </Question>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
