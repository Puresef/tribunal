'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { Topic } from '@/lib/types';
import styles from './TopicPicker.module.css';

interface TopicPickerProps {
  topics: Topic[];
  selectedTopicId: string;
  onSelect: (id: string, name?: string) => void;
  isSubmitting?: boolean;
}

export default function TopicPicker({ 
  topics, 
  selectedTopicId, 
  onSelect, 
  isSubmitting 
}: TopicPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredTopics = useMemo(() => {
    return topics.filter(t => 
      t.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [topics, search]);

  const showCreateNew = search.trim() !== '' && 
    !topics.some(t => t.name.toLowerCase() === search.toLowerCase().trim());

  const totalOptions = filteredTopics.length + (showCreateNew ? 1 : 0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

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
      if (showCreateNew && selectedIndex === filteredTopics.length) {
        onSelect('NEW', search.trim());
      } else {
        const topic = filteredTopics[selectedIndex];
        if (topic) onSelect(topic.id);
      }
      setIsOpen(false);
      setSearch('');
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const selectedTopic = topics.find(t => t.id === selectedTopicId);

  return (
    <div className={styles.pickerContainer} ref={dropdownRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => !isSubmitting && setIsOpen(!isOpen)}
        disabled={isSubmitting}
      >
        {selectedTopic ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className={styles.colorDot} style={{ backgroundColor: selectedTopic.color }} />
            {selectedTopic.name}
          </div>
        ) : (
          <span style={{ color: 'var(--text-tertiary)' }}>Select or create a topic...</span>
        )}
        <span style={{ fontSize: '10px', opacity: 0.5 }}>▼</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search or type new topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />
          <div className={styles.list}>
            {filteredTopics.map((topic, index) => (
              <div
                key={topic.id}
                className={`${styles.option} ${selectedIndex === index ? styles.optionActive : ''}`}
                onClick={() => {
                  onSelect(topic.id);
                  setIsOpen(false);
                  setSearch('');
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className={styles.colorDot} style={{ backgroundColor: topic.color }} />
                {topic.name}
              </div>
            ))}
            
            {showCreateNew && (
              <div
                className={`${styles.option} ${styles.createNew} ${selectedIndex === filteredTopics.length ? styles.optionActive : ''}`}
                onClick={() => {
                  onSelect('NEW', search.trim());
                  setIsOpen(false);
                  setSearch('');
                }}
                onMouseEnter={() => setSelectedIndex(filteredTopics.length)}
              >
                <span>➕ Create new: "{search.trim()}"</span>
              </div>
            )}

            {!showCreateNew && filteredTopics.length === 0 && (
              <div className={styles.option} style={{ opacity: 0.5, cursor: 'default' }}>
                No topics found. Type to create one.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
