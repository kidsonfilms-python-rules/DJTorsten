import tensorflow as tf
import numpy as np
import librosa
import librosa.display
import matplotlib.pyplot as plt
import pandas as pd
import os

print('STARTING DJFLAME WUP TRAINING...')

data_root = tf.keras.utils.get_file('Audio', 'https://os.unil.cloud.switch.ch/fma/fma_small.zip' , extract=True)
meta_data = tf.keras.utils.get_file('Meta' , 'https://os.unil.cloud.switch.ch/fma/fma_metadata.zip' , extract=True)

genres_df = pd.read_csv('genres.csv')
genres_df.head()

tracks_df = pd.read_csv('tracks.csv' , index_col= 0 , header = [0,1])
keep_cols = [('set', 'split'),
('set', 'subset'),('track', 'genre_top')]

df_all = tracks_df[keep_cols]
df_all = df_all[df_all[('set', 'subset')] == 'small']

df_all['track_id'] = df_all.index
df_all.head()

df_all[('track' , 'genre_top')].unique()

def readAudioFile(trackid):
  track = '{:06d}'.format(trackid)
  return os.path.join('fma_small' , track[:3] , track + '.mp3')

def createSpectrogram(trackid):
  audio = readAudioFile(trackid)
  y, sr = librosa.load(audio , duration=2.97)
  spect = librosa.feature.melspectrogram(y=y, sr=sr)
  return spect

def plotSpectrogram(trackid):
  spectrogram = createSpectrogram(trackid)
  print(spectrogram.shape)
  librosa.display.specshow(spectrogram , y_axis='mel', x_axis='time')

def getTracks(audio_dir):
  tids = []
  for _, dirnames, files in os.walk(audio_dir):
      if dirnames == []:
          tids.extend(int(file[:-4]) for file in files)
  return tids

track_ids = getTracks('fma_small')
plotSpectrogram(3400)

df_train = df_all[df_all[('set', 'split')]=='training']
df_valid = df_all[df_all[('set', 'split')]=='validation']
df_test = df_all[df_all[('set', 'split')]=='test']

print(df_train.shape, df_valid.shape, df_test.shape)

def create_dataset(df):
  genres = []
  X_spect = np.empty((0 , 128 , 128))
  count = 0
  for index, row in df.iterrows():
    try:
        count += 1
        track_id = int(row['track_id'])
        genre = str(row[('track', 'genre_top')])
        spect = createSpectrogram(track_id)
        X_spect = np.append(X_spect, [spect], axis=0)
        genres.append(genre)
        if count % 100 == 0:
            print("Currently processing: ", count)
    except:
        print("Not processed : " , count)
        continue

  y_arr = np.array(genres)
  return X_spect, y_arr

X_valid , y_valid = create_dataset(df_valid)
X_train = create_dataset(df_train)
label_dict = {'Electronic':0, 'Experimental':1, 'Folk':2, 'Hip-Hop':3, 
               'Instrumental':4,'International':5, 'Pop' :6, 'Rock': 7  }

genres = []
for label in y_valid:
  genres.append(label_dict[label])

y_valid = np.array(genres)
labels = np.array(genres)
y_valid = tf.keras.utils.to_categorical(y_valid , 8)
labels = tf.keras.utils.to_categorical(labels , 8)

def getGenre(prob_vector):
  value = np.argmax(prob_vector)
  for genre , index in label_dict.items():
    if index == value:
      return genre

print(getGenre([0., 0., 0., 1., 0., 0., 0., 0.]))

z = 0
fig , ax = plt.subplots(3 , 2 , figsize=(10 , 10))
fig.tight_layout()
for i in range(0,3):
  for j in range(0,2):
    plt.subplot(3 , 2 , z+1)
    librosa.display.specshow(X_train[z])
    plt.title(getGenre(labels[z]))
    z = z + 1

np.save('spectrograms.npy' , X_train)
np.save('labels.npy' , labels)
X_valid = np.array([x.reshape((128 , 128 , 1)) for x in X_valid])

model = tf.keras.Sequential()
input_shape = (128 , 128 , 1)

model.add(tf.keras.layers.Conv2D(24 , (5 , 5) , strides=(1 , 1) , input_shape=input_shape))
model.add(tf.keras.layers.MaxPooling2D((4,2) , strides=(4 , 2)))
model.add(tf.keras.layers.Activation('relu'))

model.add(tf.keras.layers.Conv2D(48 , (5 , 5) , padding='valid'))
model.add(tf.keras.layers.MaxPooling2D((4 , 2) , strides=(4 , 2)))
model.add(tf.keras.layers.Activation('relu'))

model.add(tf.keras.layers.Conv2D(48 , (5 , 5) , padding='valid'))
model.add(tf.keras.layers.Activation('relu'))

model.add(tf.keras.layers.Flatten())
model.add(tf.keras.layers.Dropout(0.5))

model.add(tf.keras.layers.Dense(64))
model.add(tf.keras.layers.Activation('relu'))
model.add(tf.keras.layers.Dropout(0.5))

model.add(tf.keras.layers.Dense(8))
model.add(tf.keras.layers.Activation('softmax'))

model.summary()

callbacks = [
    tf.keras.callbacks.EarlyStopping(patience=10, verbose=1),
    tf.keras.callbacks.ReduceLROnPlateau(factor=0.1, patience=10, min_lr=0.00001, verbose=1),
    tf.keras.callbacks.ModelCheckpoint('model.h5', verbose=1, save_best_only=True, save_weights_only=True),
]

model.compile(
    optimizer='Adam',
    loss='categorical_crossentropy',
    metrics = ['accuracy']
)

model.fit(
    x=X_train,
    y=labels,
    epochs=50,
    batch_size=128,
    validation_data=(X_valid , y_valid),
    callbacks=callbacks,
)