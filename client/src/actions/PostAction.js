import * as PostApi from '../api/PostRequest';

export const getAllPosts = () => async (dispatch) => {
    dispatch({ type: "RETRIEVING_START" });
    try {
        const { data } = await PostApi.getAllPosts();
        dispatch({ type: "RETRIEVING_SUCCESS", data: data });
    } catch (error) {
        console.log(error);
        dispatch({ type: "RETRIEVING_FAIL" });
    }
};

export const getTimelinePosts = (id) => async (dispatch) => {
    dispatch({ type: "RETRIEVING_START" });
    try {
        const { data } = await PostApi.getTimelinePosts(id);
        dispatch({ type: "RETRIEVING_SUCCESS", data: data });
    } catch (error) {
        console.log(error);
        dispatch({ type: "RETRIEVING_FAIL" });
    }
};

export const deletePost = (id, userId) => async (dispatch) => {
    try {
        await PostApi.deletePost(id, userId);
        dispatch(getTimelinePosts(userId)); // Refresh posts after deletion
    } catch (error) {
        console.log(error);
    }
};