import { redirect } from 'next/navigation'

export default function NotFound() {
    // redireciona para uma página específica
    redirect('/12')
    return null
}