import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { useClerk } from '@clerk/clerk-react'
import { BotIcon, SendIcon, SparklesIcon, TicketIcon, ClockIcon, StarIcon, UserIcon } from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })
}

// ─── Show Card ───────────────────────────────────────────────────────────────

const ShowCard = ({ show, onBook }) => {
    const { image_base_url } = useAppContext()
    return (
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group">
            {show.poster_path && (
                <img
                    src={image_base_url + show.poster_path}
                    alt={show.title}
                    className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                />
            )}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white truncate">{show.title}</p>
                <div className="flex items-center gap-2 text-gray-400 text-xs mt-0.5">
                    <span className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3 text-gray-400" />
                        {formatTime(show.showDateTime)}
                    </span>
                    {show.recommendedSeats?.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium text-[11px]">
                            <SparklesIcon className="w-2.5 h-2.5" />
                            Auto-Seats: {show.recommendedSeats.join(', ')}
                        </span>
                    )}
                </div>
                {show.genres?.length > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{show.genres.join(', ')}</p>
                )}
                <p className="text-primary font-bold text-sm mt-1">${show.price} / seat</p>
            </div>
            <button
                onClick={() => onBook(show)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-lg font-semibold cursor-pointer active:scale-95 whitespace-nowrap shadow-lg shadow-primary/20"
            >
                <TicketIcon className="w-3.5 h-3.5" />
                Book
            </button>
        </div>
    )
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

const MessageBubble = ({ msg, onBook }) => {
    const isUser = msg.role === 'user'
    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                ${isUser ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white'}`}>
                {isUser ? <UserIcon className="w-4 h-4" /> : <BotIcon className="w-4 h-4" />}
            </div>

            <div className={`flex flex-col gap-2 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Text */}
                {msg.text && (
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                        ${isUser
                            ? 'bg-primary text-white rounded-tr-sm'
                            : 'bg-white/8 border border-white/10 text-gray-100 rounded-tl-sm'
                        }`}>
                        {msg.text}
                    </div>
                )}

                {/* Show Cards */}
                {msg.shows && msg.shows.length > 0 && (
                    <div className="w-full space-y-2 mt-1">
                        {msg.shows.map((show) => (
                            <ShowCard key={show.showId} show={show} onBook={onBook} />
                        ))}
                    </div>
                )}

                {/* Loading dots */}
                {msg.loading && (
                    <div className="px-4 py-3 bg-white/8 border border-white/10 rounded-2xl rounded-tl-sm">
                        <div className="flex gap-1 items-center">
                            <span className="text-xs text-gray-400 mr-2">Searching</span>
                            {[0, 1, 2].map(i => (
                                <span key={i} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                                    style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Suggestion Chips ─────────────────────────────────────────────────────────

const suggestions = [
    "Comedy tonight after 7 PM under $15",
    "Action movie tomorrow evening for 2",
    "Horror show this weekend under $10",
    "Best rated movies playing today",
]

// ─── Main Agent Chat Page ─────────────────────────────────────────────────────

const AgentChat = () => {
    const { axios, getToken, user } = useAppContext()
    const { openSignIn } = useClerk()
    const navigate = useNavigate()
    const bottomRef = useRef(null)
    const inputRef = useRef(null)

    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            role: 'agent',
            text: "Hi! I'm QuickShow AI 🎬\n\nTell me what you're in the mood for and I'll find the perfect show for you.\n\nFor example: \"Comedy tonight after 7 PM under ₹500 for 2 people\"",
            shows: [],
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [history, setHistory] = useState([])   // Gemini conversation history for multi-turn

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    const handleBook = (show) => {
        // Navigate to existing booking page: /movies/:movieId/:date with auto-selected state
        navigate(`/movies/${show.movieId}/${show.showDateStr}`, {
            state: {
                showId: show.showId,
                seats: show.recommendedSeats || ['E4'],
                time: show.showDateTime,
                fromAgent: true
            }
        })
        scrollTo(0, 0)
    }

    const sendMessage = async (text) => {
        const trimmed = text.trim()
        if (!trimmed || isLoading) return

        if (!user) {
            openSignIn()
            return toast.error('Please sign in to use QuickShow AI')
        }

        setInput('')

        // Add user message
        const userMsg = { id: Date.now() + '_user', role: 'user', text: trimmed, shows: [] }
        // Add loading indicator
        const loadingMsg = { id: Date.now() + '_loading', role: 'agent', loading: true, shows: [] }

        setMessages(prev => [...prev, userMsg, loadingMsg])
        setIsLoading(true)

        try {
            const token = await getToken()
            const { data } = await axios.post(
                '/api/agent/chat',
                { message: trimmed, history },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            // Remove loading indicator and add real response
            setMessages(prev => {
                const withoutLoading = prev.filter(m => !m.loading)
                return [
                    ...withoutLoading,
                    {
                        id: Date.now() + '_agent',
                        role: 'agent',
                        text: data.success ? data.message : (data.message || 'Something went wrong. Please try again.'),
                        shows: data.success ? (data.shows || []) : [],
                    }
                ]
            })

            if (data.success && data.history) {
                setHistory(data.history)
            }

        } catch (error) {
            setMessages(prev => {
                const withoutLoading = prev.filter(m => !m.loading)
                return [
                    ...withoutLoading,
                    {
                        id: Date.now() + '_error',
                        role: 'agent',
                        text: 'Sorry, I ran into an error. Please try again.',
                        shows: [],
                    }
                ]
            })
        } finally {
            setIsLoading(false)
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        sendMessage(input)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage(input)
        }
    }

    return (
        <div className="min-h-screen bg-[#09090B] flex flex-col">

            {/* ── Header ── */}
            <div className="sticky top-0 z-10 pt-20 pb-4 px-4 md:px-6 border-b border-white/8 bg-[#09090B]/80 backdrop-blur-md">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                        <SparklesIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-white">QuickShow AI</h1>
                        <p className="text-xs text-gray-500">Your intelligent movie show finder</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs text-gray-400">Online</span>
                    </div>
                </div>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 pt-6 pb-36">
                <div className="max-w-3xl mx-auto space-y-6">

                    {messages.map(msg => (
                        <MessageBubble key={msg.id} msg={msg} onBook={handleBook} />
                    ))}

                    <div ref={bottomRef} />
                </div>
            </div>

            {/* ── Suggestion Chips (shown only when no conversation yet) ── */}
            {messages.length === 1 && (
                <div className="px-4 md:px-6 pb-3">
                    <div className="max-w-3xl mx-auto">
                        <p className="text-xs text-gray-600 mb-2 ml-1">Try asking:</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => sendMessage(s)}
                                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:border-primary/40 hover:text-white transition-all cursor-pointer"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Input Bar ── */}
            <div className="sticky bottom-0 px-4 md:px-6 pb-6 pt-3 bg-gradient-to-t from-[#09090B] via-[#09090B]/95 to-transparent">
                <div className="max-w-3xl mx-auto">
                    {!user && (
                        <div className="mb-3 px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between">
                            <p className="text-sm text-gray-300">Sign in to search for shows</p>
                            <button onClick={openSignIn} className="text-xs px-4 py-1.5 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer">
                                Sign In
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="flex items-end gap-3">
                        <div className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 focus-within:border-primary/50 rounded-2xl transition-all overflow-hidden">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="What movie are you in the mood for?"
                                disabled={isLoading}
                                rows={1}
                                className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-gray-600 resize-none outline-none leading-relaxed"
                                style={{ maxHeight: '120px', overflowY: 'auto' }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl bg-primary hover:bg-primary-dull disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
                        >
                            <SendIcon className="w-4 h-4" />
                        </button>
                    </form>
                    <p className="text-center text-xs text-gray-700 mt-2">
                        AI finds shows · You choose · Existing checkout handles payment
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AgentChat
