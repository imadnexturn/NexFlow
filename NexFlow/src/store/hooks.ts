import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

/** Typed dispatch — use this instead of plain `useDispatch`. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()

/** Typed selector — use this instead of plain `useSelector`. */
export const useAppSelector = useSelector.withTypes<RootState>()
