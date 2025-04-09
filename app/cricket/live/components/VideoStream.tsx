interface VideoStreamProps {
    matchId: string
    width?: string | number
    height?: string | number
}

export const VideoStream = ({ matchId, width = "100%", height = "400px" }: VideoStreamProps) => {
    return (
        <iframe
            src={`https://tvapp.1ten.live/event-play-2/${matchId}`}
            style={{
                width,
                height,
                border: 'none',
                display: 'block',
                backgroundColor: 'transparent',
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            allowFullScreen
        />
    )
}
