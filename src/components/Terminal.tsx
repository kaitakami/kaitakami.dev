'use client'

import { useState, useRef, useEffect } from 'react'
import websiteData from '../../website-data'
import { blogs } from '@/content/blogs'
import { projects } from '@/content/projects'
import type { Blog } from '@/components/Blogs'
import type { Project } from '@/components/Projects'

const ASCII_TITLE = `
 ___  __    ________  ___     
|\\  \\|\\  \\ |\\   __  \\|\\  \\    
\\ \\  \\/  /|\\ \\  \\|\\  \\ \\  \\   
 \\ \\   ___  \\ \\   __  \\ \\  \\  
  \\ \\  \\\\ \\  \\ \\  \\ \\  \\ \\  \\ 
   \\ \\__\\\\ \\__\\ \\__\\ \\__\\ \\__\\
    \\|__| \\|__|\\|__|\\|__|\\|__|

 _________  ________  ___  __    ________  _____ ______   ___     
|\\___   ___\\\\   __  \\|\\  \\|\\  \\ |\\   __  \\|\\   _ \\  _   \\|\\  \\    
\\|___ \\  \\_\\ \\  \\|\\  \\ \\  \\/  /|\\ \\  \\|\\  \\ \\  \\\\\\__\\ \\  \\ \\  \\   
     \\ \\  \\ \\ \\   __  \\ \\   ___  \\ \\   __  \\ \\  \\\\|__| \\  \\ \\  \\  
      \\ \\  \\ \\ \\  \\ \\  \\ \\  \\\\ \\  \\ \\  \\ \\  \\ \\  \\    \\ \\  \\ \\  \\ 
       \\ \\__\\ \\ \\__\\ \\__\\ \\__\\\\ \\__\\ \\__\\ \\__\\ \\__\\    \\ \\__\\ \\__\\
        \\|__|  \\|__|\\|__|\\|__| \\|__|\\|__|\\|__|\\|__|     \\|__|\\|__|`

const commands: Record<string, { desc: string; order: number }> = {
  whois: { desc: 'display information about me', order: 1 },
  socials: { desc: 'display social links', order: 2 },
  ls: { desc: 'list directories', order: 3 },
  cd: { desc: 'change directory', order: 4 },
  info: { desc: 'show project info', order: 5 },
  open: { desc: 'open a link (social/blog/project)', order: 6 },
  help: { desc: 'list all commands', order: 7 },
  clear: { desc: 'clear the console', order: 8 },
  normal: { desc: 'switch to normal website view', order: 9 },
}

type OutputLine = {
  id: number;
  text: string;
  type?: 'command' | 'error' | 'success' | 'help';
}

type ResponseLine = {
  text: string;
  type?: 'command' | 'error' | 'success' | 'help';
}

const handleTabCompletion = (
  e: React.KeyboardEvent<HTMLInputElement>, 
  input: string, 
  setInput: (value: string) => void, 
  setOutput: React.Dispatch<React.SetStateAction<OutputLine[]>>, 
  nextId: number, 
  setNextId: (value: number) => void,
  currentDir: string
) => {
  if (e.key === 'Tab') {
    e.preventDefault()
    const [command, arg] = input.split(' ')
    
    if (!command || command === '') {
      const commands = ['help', 'whois', 'socials', 'ls', 'cd', 'info', 'open', 'clear', 'normal']
      setOutput(prev => [
        ...prev,
        { id: nextId, text: input, type: 'command' },
        { id: nextId + 1, text: commands.join('\n'), type: 'success' }
      ])
      setNextId(nextId + 2)
      return
    }

    if (command === 'open' && (!arg || arg === '')) {
      const allOptions = [
        ...websiteData.socials.map((s) => s.text.toLowerCase()),
        ...blogs.filter(b => b.date).map((b: Blog) => `blogs/${b.slug}`),
        ...projects.map((p: Project) => `projects/${p.title.toLowerCase()}`)
      ]
      setOutput(prev => [
        ...prev,
        { id: nextId, text: input, type: 'command' },
        { id: nextId + 1, text: `Available options:\n${allOptions.join('\n')}`, type: 'success' }
      ])
      setNextId(nextId + 2)
      return
    }

    if (command === 'cd' && (!arg || arg === '')) {
      const dirs = ['blogs', 'projects']
      setOutput(prev => [
        ...prev,
        { id: nextId, text: input, type: 'command' },
        { id: nextId + 1, text: `Available directories:\n${dirs.join('\n')}`, type: 'success' }
      ])
      setNextId(nextId + 2)
      return
    }

    if (command === 'info' && (!arg || arg === '')) {
      const projectNames = currentDir === 'projects'
        ? projects.map((p: Project) => p.title.toLowerCase())
        : projects.map((p: Project) => `projects/${p.title.toLowerCase()}`)
      setOutput(prev => [
        ...prev,
        { id: nextId, text: input, type: 'command' },
        { id: nextId + 1, text: `Available projects:\n${projectNames.join('\n')}`, type: 'success' }
      ])
      setNextId(nextId + 2)
      return
    }

    if (command === 'cd' && arg) {
      const dirs = ['blogs', 'projects']
      const matches = dirs.filter(d => d.startsWith(arg.toLowerCase()))
      if (matches.length === 1) {
        setInput(`cd ${matches[0]}`)
      } else if (matches.length > 0) {
        setOutput(prev => [
          ...prev,
          { id: nextId, text: input, type: 'command' },
          { id: nextId + 1, text: `Matching directories:\n${matches.join('\n')}`, type: 'success' }
        ])
        setNextId(nextId + 2)
      }
      return
    }

    if ((command === 'open' || command === 'info') && arg) {
      const possibleCompletions = command === 'open' 
        ? currentDir === 'blogs'
          ? blogs.filter(b => b.date).map((b: Blog) => b.slug)
          : currentDir === 'projects'
          ? projects.map((p: Project) => p.title.toLowerCase())
          : [...websiteData.socials.map((s) => s.text.toLowerCase()),
             ...blogs.filter(b => b.date).map((b: Blog) => `blogs/${b.slug}`),
             ...projects.map((p: Project) => `projects/${p.title.toLowerCase()}`)]
        : currentDir === 'projects'
          ? projects.map((p: Project) => p.title.toLowerCase())
          : projects.map((p: Project) => `projects/${p.title.toLowerCase()}`)

      const matches = possibleCompletions.filter(item => item.startsWith(arg.toLowerCase()))
      if (matches.length === 1) {
        setInput(`${command} ${matches[0]}`)
      } else if (matches.length > 0) {
        setOutput(prev => [
          ...prev,
          { id: nextId, text: input, type: 'command' },
          { id: nextId + 1, text: `Matching options:\n${matches.join('\n')}`, type: 'success' }
        ])
        setNextId(nextId + 2)
      }
    }
  }
}

export default function Terminal({ onSwitchView }: { onSwitchView: () => void }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState<OutputLine[]>([
    { id: 1, text: 'ようこそ!', type: 'success' },
    { id: 2, text: 'Not into command lines? Type "normal" and hit enter for the normie view.', type: 'success' },
    { id: 3, text: 'Otherwise, type "help" to get started.', type: 'success' }
  ])
  const inputRef = useRef<HTMLInputElement>(null)
  const outputEndRef = useRef<HTMLDivElement>(null)
  const [nextId, setNextId] = useState(4)
  const [currentDir, setCurrentDir] = useState('')

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    const scrollToBottom = () => {
      outputEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    // Only scroll when new output is added
    if (output.length > 0) {
      scrollToBottom()
    }
  }, [output.length])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const [command, ...args] = input.trim().toLowerCase().split(' ')
    let response: ResponseLine[]

    switch (command) {
      case 'help':
        response = Object.entries(commands)
          .sort((a, b) => a[1].order - b[1].order)
          .map(([cmd, { desc }]) => ({
            text: `${cmd}\t${desc}`,
            type: 'help'
          }))
        break
      case 'clear':
        setOutput([])
        setInput('')
        return
      case 'whois':
        response = [
          {
            text: 'Full-stack software engineer with 3+ years of experience focused on building user-centric products,',
            type: 'success'
          },
          {
            text: 'delivering high-quality code, emphasizing reliable systems, and ensuring scalability.',
            type: 'success'
          }
        ]
        break
      case 'socials':
        response = websiteData.socials.map(social => ({
          text: `${social.text}: type 'open ${social.text.toLowerCase()}' to visit`,
          type: 'success'
        }))
        break
      case 'open':
        if (!args[0]) {
          response = [{
            text: 'Usage: open <social/blog/project>',
            type: 'error'
          }]
        } else {
          const target = args[0].toLowerCase()
          const social = websiteData.socials.find(s => s.text.toLowerCase() === target)
          const [type, name] = target.split('/')
          
          if (social) {
            window.open(social.href, '_blank')
            response = [{ text: `Opening ${social.text}...`, type: 'success' }]
          } else if (currentDir === 'blogs' || type === 'blogs') {
            const blogSlug = currentDir === 'blogs' ? target : name
            const blog = blogs.find((b: Blog) => b.slug === blogSlug)
            if (blog) {
              if (!blog.date) {
                response = [{ text: 'This blog post is coming soon!', type: 'error' }]
              } else {
                window.open(`/blog/${blog.slug}`, '_blank')
                response = [{ text: `Opening blog: ${blog.title}...`, type: 'success' }]
              }
            } else {
              response = [{ text: 'Blog not found.', type: 'error' }]
            }
          } else if (currentDir === 'projects' || type === 'projects') {
            const projectName = currentDir === 'projects' ? target : name
            const project = projects.find((p: Project) => p.title.toLowerCase() === projectName)
            if (project) {
              const link = project.demo || project.github
              if (link) {
                window.open(link, '_blank')
                response = [{ text: `Opening project: ${project.title}...`, type: 'success' }]
              } else {
                response = [{ text: 'No link available for this project.', type: 'error' }]
              }
            } else {
              response = [{ text: 'Project not found.', type: 'error' }]
            }
          } else {
            response = [{ text: 'Not found. Type "socials" to see available links.', type: 'error' }]
          }
        }
        break
      case 'normal':
        onSwitchView()
        return
      case 'ls':
        if (currentDir === 'blogs') {
          response = blogs.map(blog => ({
            text: `${blog.slug}${!blog.date ? ' <soon>' : ''}`,
            type: 'success'
          }))
        } else if (currentDir === 'projects') {
          response = projects.map(project => ({
            text: project.title,
            type: 'success'
          }))
        } else {
          response = [{
            text: 'blogs/\nprojects/',
            type: 'success'
          }]
        }
        break
      case 'cd':
        if (!args[0]) {
          response = [{
            text: 'Usage: cd <blogs|projects>',
            type: 'error'
          }]
        } else if (args[0] === '..') {
          setCurrentDir('')
          response = [{ text: 'Moving to root directory', type: 'success' }]
        } else if (['blogs', 'projects'].includes(args[0])) {
          setCurrentDir(args[0])
          response = [{ text: `Moving to ${args[0]} directory`, type: 'success' }]
        } else {
          response = [{ text: 'Directory not found', type: 'error' }]
        }
        break
      case 'info':
        if (!args[0]) {
          response = [{
            text: 'Usage: info <project-name>',
            type: 'error'
          }]
        } else {
          const [type, name] = args[0].split('/')
          const projectName = currentDir === 'projects' ? args[0] : (type === 'projects' ? name : args[0])
          const project = projects.find((p: Project) => 
            p.title.toLowerCase() === projectName.toLowerCase()
          )
          if (project) {
            response = [{
              text: `${project.title}\n${project.description}\n${
                project.date ? `Date: ${project.date}\n` : ''
              }${project.github ? `GitHub: ${project.github}\n` : ''}${
                project.demo ? `Demo: ${project.demo}` : ''
              }`,
              type: 'success'
            }]
          } else {
            response = [{ text: 'Project not found', type: 'error' }]
          }
        }
        break
      default:
        response = [{
          text: 'Command not recognized. Type "help" for a list of commands.',
          type: 'error'
        }]
    }

    const newLines: OutputLine[] = [
      { id: nextId, text: input, type: 'command' },
      ...response.map((res, i) => ({ 
        id: nextId + i + 1, 
        text: res.text, 
        type: res.type 
      }))
    ]
    
    setNextId(nextId + response.length + 1)
    setOutput(prev => [...prev, ...newLines])
    setInput('')
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a15] via-[#1a1b2e] to-[#0a0a15] text-white p-4 font-mono flex flex-col h-screen">
      <div className="sr-only">
        <a href="https://github.com/kaitakami" rel="me">GitHub</a>
        <a href="https://twitter.com/kaitakami_" rel="me">Twitter</a>
        <a href="https://www.linkedin.com/in/kaitakami" rel="me">LinkedIn</a>
      </div>
      <pre className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff00] via-[#00ffff] to-[#00ff00] mb-4 whitespace-pre-wrap text-[0.25rem] sm:text-[0.45rem] md:text-[0.6rem] overflow-x-auto animate-gradient-x drop-shadow-[0_0_15px_rgba(0,255,255,0.4)]">{ASCII_TITLE}</pre>
      <h1 className='sr-only'>Kai Takami</h1>
      <div className="flex-1 overflow-auto text-xs sm:text-sm">
        {output.map((line, index) => (
          <div key={line.id} className={`flex min-w-0 relative ${
            line.type === 'command' ? 'mt-6' : 'mt-1'
          }`}>
            {line.type === 'command' && index > 0 && (
              <div className="absolute inset-0 border-t border-[#565f89]/15 -mt-4 pointer-events-none" />
            )}
            <div className="w-full flex">
              {line.type === 'command' && (
                <span className="flex-none flex mr-2">
                  <span className="text-[#00ff00] drop-shadow-[0_0_10px_rgba(0,255,0,0.3)]">guest</span>
                  <span className="text-[#565f89]">:</span>
                  <span className="text-[#00ffff] drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">kaitakami</span>
                  <span className="text-[#d4d4d4] whitespace-nowrap">{currentDir ? `/${currentDir}` : ' ~'} $&nbsp;</span>
                </span>
              )}
              {line.type === 'help' ? (
                <pre className="whitespace-pre-wrap min-w-0 overflow-x-auto">
                  <span className="text-[#ff00ff] drop-shadow-[0_0_10px_rgba(255,0,255,0.3)]">{line.text.split('\t')[0]}</span>
                  <span className="text-[#00ff9d] drop-shadow-[0_0_10px_rgba(0,255,157,0.3)]">{`\t${line.text.split('\t')[1]}`}</span>
                </pre>
              ) : (
                <pre className={`whitespace-pre-wrap min-w-0 overflow-x-auto ${
                  line.type === 'error' ? 'text-[#ff3333] drop-shadow-[0_0_10px_rgba(255,51,51,0.3)]' : 
                  line.type === 'command' ? 'text-[#d4d4d4]' : 
                  line.type === 'success' ? 'text-[#e0b0ff] drop-shadow-[0_0_10px_rgba(224,176,255,0.4)]' : 'text-[#d4d4d4]'
                }`}>{line.text}</pre>
              )}
            </div>
          </div>
        ))}
        <div ref={outputEndRef} />
        <div className="relative mt-6">
          <div className="absolute inset-0 border-t border-[#565f89]/15 -mt-4 pointer-events-none" />
          <form onSubmit={handleInputSubmit} className="flex text-sm sm:text-base items-center min-w-0">
            <span className="flex-none flex">
              <span className="text-[#00ff00] drop-shadow-[0_0_10px_rgba(0,255,0,0.3)]">guest</span>
              <span className="text-[#565f89]">:</span>
              <span className="text-[#00ffff] drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">kaitakami</span>
              <span className="text-[#d4d4d4] whitespace-nowrap">{currentDir ? `/${currentDir}` : ' ~'} $</span>
            </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => handleTabCompletion(e, input, setInput, setOutput, nextId, setNextId, currentDir)}
              className="flex-grow bg-transparent outline-none text-[#d4d4d4] ml-2 h-6 leading-6 min-w-0"
              aria-label="Terminal input"
            />
          </form>
        </div>
      </div>
    </div>
  )
} 