import { create } from 'zustand'

export type AppId = 'about'|'projects'|'security'|'writeups'|'certifications'|'files'|'contact'|'terminal'|'system'
export type ManagedWindow = {id:AppId;z:number;minimized?:boolean;maximized?:boolean;x:number;y:number;w:number;h:number}
type WindowState = {windows:ManagedWindow[];setWindows:(next:ManagedWindow[]|((current:ManagedWindow[])=>ManagedWindow[]))=>void}
export const useWindowManager=create<WindowState>((set)=>({windows:[],setWindows:(next)=>set(state=>({windows:typeof next==='function'?next(state.windows):next}))}))
