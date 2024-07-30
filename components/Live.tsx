import React, { KeyboardEvent, useCallback, useEffect, useState } from 'react';
import LiveCursor from './cursor/LiveCursor';
import { useBroadcastEvent, useEventListener, useMyPresence, useOthers } from '@liveblocks/react';
import CursorChat from './cursor/CursorChat';
import { CursorMode, CursorState, Reaction, ReactionEvent } from '@/types/type';
import ReactionSelector from './Reaction/ReactionButton';
import FlyingReaction from './Reaction/FlyingReaction';
import useInterval from '@/hooks/useInterval';

const Live = () => {
    const others = useOthers();
    const [{ cursor }, updateMyPresence] = useMyPresence();
    const broadcast = useBroadcastEvent();

    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [cursorState, setCursorState] = useState<CursorState>({
        mode: CursorMode.Hidden,
    });

    useInterval(() => {
        if (cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor) {
            const newReaction = {
                point: { x: cursor.x, y: cursor.y },
                value: cursorState.reaction,
                timestamp: Date.now(),
            };
            setReactions((reactions) => [...reactions, newReaction]);
            broadcast(newReaction);
        }
    }, 100);

    useEventListener((eventData) => {
        const event = eventData.event as ReactionEvent;
        const newReaction = {
            point: { x: event.x, y: event.y },
            value: event.value,
            timestamp: Date.now(),
        };
        setReactions((reactions) => [...reactions, newReaction]);
    });

    const handlePointerMove = useCallback((event: React.PointerEvent) => {
        event.preventDefault();
        if (cursorState.mode !== CursorMode.ReactionSelector) {
            const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
            const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
            updateMyPresence({ cursor: { x, y } });
        }
    }, [cursorState.mode, updateMyPresence]);

    const handlePointerLeave = useCallback(() => {
        setCursorState({ mode: CursorMode.Hidden });
        updateMyPresence({ cursor: null, message: null });
    }, [updateMyPresence]);

    const handlePointerDown = useCallback((event: React.PointerEvent) => {
        const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
        updateMyPresence({ cursor: { x, y } });
        setCursorState((state) => cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state);
    }, [cursorState.mode, updateMyPresence]);

    const setReaction = useCallback((reaction: string) => {
        setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
    }, []);

    const handlePointerUp = useCallback(() => {
        setCursorState((state) => cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: false } : state);
    }, [cursorState.mode]);

    useEffect(() => {
        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key === '/') {
                setCursorState({ mode: CursorMode.Chat, previousMessage: null, message: '' });
            } else if (e.key === 'Escape') {
                updateMyPresence({ message: '' });
                setCursorState({ mode: CursorMode.Hidden });
            } else if (e.key === 'e') {
                setCursorState({ mode: CursorMode.ReactionSelector });
            }
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/') {
                e.preventDefault();
            }
        };

        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [updateMyPresence]);

    return (
        <div
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            className="border-2 border-green-500 h-[100vh] w-full flex justify-center items-center text-center"
        >
            <h1 className="text-2xl text-white">Liveblocks Project</h1>
            {reactions.map((reaction) => (
                <FlyingReaction
                    key={reaction.timestamp.toString()}
                    x={reaction.point.x}
                    y={reaction.point.y}
                    timestamp={reaction.timestamp}
                    value={reaction.value}
                />
            ))}
            {cursor && (
                <CursorChat
                    cursor={cursor}
                    cursorState={cursorState}
                    setCursorState={setCursorState}
                    updateMyPresence={updateMyPresence}
                />
            )}
            {cursorState.mode === CursorMode.ReactionSelector && (
                <ReactionSelector setReaction={setReaction} />
            )}
            <LiveCursor others={others} />
        </div>
    );
};

export default Live;
