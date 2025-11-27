import { useDispatch  } from "react-redux";
import { setFilter } from "../reducers/filterReducer";

const SearchFilter = () => {
    const dispatch = useDispatch();

    return (
        <div>
            filter <input onChange={(e) => dispatch(setFilter(e.target.value))} />
        </div>
    )
}

export default SearchFilter;