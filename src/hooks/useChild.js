import { useDispatch, useSelector } from "react-redux";
import { fetchChildren, createChild, updateChild, selectChild } from "../store/slices/childSlice";
import { selectChildren, selectSelectedChild, selectChildLoading } from "../store/slices/childSlice";
export function useChild() {
  const dispatch = useDispatch();
  return {
    children:    useSelector(selectChildren),
    selected:    useSelector(selectSelectedChild),
    loading:     useSelector(selectChildLoading),
    fetchAll:    ()           => dispatch(fetchChildren()),
    create:      (data)       => dispatch(createChild(data)),
    update:      (id, data)   => dispatch(updateChild({ id, data })),
    setSelected: (child)      => dispatch(selectChild(child)),
  };
}
