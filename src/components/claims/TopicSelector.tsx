'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { Topic } from '@/lib/types';
import styles from './boardRefinement.module.css';

interface TopicSelectorProps {
  topics: Topic[];
  selectedTopicId: string | null;
  onSelect: (id: string | null) => void;
  topicCounts: Record<string, number>;
}

export default function TopicSelector({ topics, selectedTopicId, onSelect, topicCounts }: TopicSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter topics based on search
  const filteredTopics = useMemo(() => {
    const list = topics
      .filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (topicCounts[b.id] || 0) - (topicCounts[a.id] || 0));
    
    // Include "All Topics" at the top of the selectable list if searching
    return list;
  }, [topics, search, topicCounts]);

  const totalOptions = filteredTopics.length + 1; // +1 for "All Topics"

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Handle clicks outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % totalOptions);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + totalOptions) % totalOptions);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex === 0) {
        onSelect(null);
      } else {
        const topic = filteredTopics[selectedIndex - 1];
        if (topic) onSelect(topic.id);
      }
      setIsOpen(false);
      setSearch('');
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const selectedTopicName = useMemo(() => {
    if (!selectedTopicId) return null;
    return topics.find(t => t.id === selectedTopicId)?.name;
  }, [selectedTopicId, topics]);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        className={styles.searchTrigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={styles.searchIcon}>🔍</span>
        <span>{selectedTopicName ? `Searching: ${selectedTopicName}` : 'Search Topics...'}</span>
      </button>

      {isOpen && (
        <div className={styles.topicDropdown}>
          <input 
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Search all topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />
          <div className={styles.topicList}>
            <div 
              className={`${styles.topicOption} ${selectedIndex === 0 ? styles.topicOptionActive : ''}`}
              onClick={() => {
                onSelect(null);
                setIsOpen(false);
                setSearch('');
              }}
              onMouseEnter={() => setSelectedIndex(0)}
            >
              <span>All Topics</span>
              <span className={styles.topicCount}>{Object.values(topicCounts).reduce((a, b) => a + b, 0)}</span>
            </div>
            {filteredTopics.map((topic, index) => (
              <div 
                key={topic.id}
                className={`${styles.topicOption} ${selectedIndex === index + 1 ? styles.topicOptionActive : ''}`}
                onClick={() => {
                  onSelect(topic.id);
                  setIsOpen(false);
                  setSearch('');
                }}
                onMouseEnter={() => setSelectedIndex(index + 1)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: topic.color }} />
                  <span>{topic.name}</span>
                </div>
                <span className={styles.topicCount}>{topicCounts[topic.id] || 0}</span>
              </div>
            ))}
            {filteredTopics.length === 0 && (
              <div className={styles.topicOption} style={{ opacity: 0.5, cursor: 'default' }}>
                No topics found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
