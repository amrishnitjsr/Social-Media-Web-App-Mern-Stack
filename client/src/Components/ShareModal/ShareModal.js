import { Modal } from '@mantine/core';
import PostShare from '../PostShare/PostShare';

function ShareModal({ modalOpened, setModalOpened }) {
    return (
        <>
            <Modal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                size="55%"
                overlayProps={{
                    color: '#000',
                    opacity: 0.55,
                    blur: 3,
                }}
            >

                <PostShare />

            </Modal>

        </>
    );
}


export default ShareModal