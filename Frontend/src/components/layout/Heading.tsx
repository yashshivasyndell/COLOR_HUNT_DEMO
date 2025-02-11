interface HeadingProps {
    title: string
    content: JSX.Element,
}

export const Heading: React.FC<HeadingProps> = ({ title, content }) => {
    return (
        <div className="main-wrapper mt-3 w-full mb-16 md:px-4">
            <div className="flex flex-col gap-3 md:flex-row items-center justify-between">
                {/* Title */}
                <div>
                <h3 className="capitalize font-semibold tracking-wide text-xl lg:text-[30px]">{title}</h3>
                </div>

                {/* Content */}
                <div className="md:w-fit w-full">
                   {content}
                </div>
            </div>
        </div>
    )
}