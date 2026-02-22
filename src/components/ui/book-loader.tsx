"use client";

import React from "react";
import styles from "./bookLoader.module.css";

export function BookLoader() {
  return (
    <div className={styles["loader-wrapper"]}>
      <div className={styles.book}>
        <div className={styles.cover}></div>
        <div className={`${styles.page} ${styles.page1}`}></div>
        <div className={`${styles.page} ${styles.page2}`}></div>
        <div className={`${styles.page} ${styles.page3}`}></div>
        <div className={`${styles.page} ${styles.page4}`}></div>
        <div className={`${styles.page} ${styles.page5}`}></div>
      </div>
    </div>
  );
}

export function FullBookLoader() {
  return <BookLoader />;
}
